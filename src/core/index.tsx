import React, {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  Ref,
} from 'react'
import { FormContext } from './context'
import {
  RequireRule,
  PatternRule,
  RangeMinRule,
  RangeMaxRule,
  RangeMinLengthRule,
  RangeMaxLengthRule,
  FormRefType,
  Rules,
  FormValues,
  CheckMode,
  ErrorsType,
} from './types'
import { singleObjToArray } from '../util/single_obj_to_array'
import { isEmpty } from '../util/object'

interface Props {
  // eslint-disable-next-line
  onSubmit: (values?: FormValues) => void
  onSubmitFailed?: (errors: ErrorsType) => void
  registerError?: React.Dispatch<React.SetStateAction<{}>> // 数据校验结果分两种模式
  initialValues?: FormValues // NOTE: 组件动态初始值
  checkMode?: CheckMode
}
const AForm: React.ForwardRefRenderFunction<
  FormRefType,
  React.PropsWithChildren<Props>
> = (props: React.PropsWithChildren<Props>, ref: Ref<FormRefType>) => {
  const { onSubmit, children, initialValues, onSubmitFailed } = props
  const [values, setValues] = useState<FormValues>(initialValues ?? {})
  const [rules, setRules] = useState<Rules>()
  const [checkModes, setCheckModes] = useState({})

  useEffect(() => {
    if (initialValues && isEmpty(values)) {
      setValues(initialValues)
    }
  }, [initialValues, values])

  const innerErrors = useRef<Record<string, any>>({})

  const setErrors = (errors: Record<string, any>) => {
    const { registerError } = props
    if (registerError) {
      Object.keys(errors).forEach((name) => {
        const value = errors[name]
        const error = { [name]: value }
        if (value) {
          Object.assign(innerErrors.current, error)
        } else {
          if (Object.prototype.hasOwnProperty.call(innerErrors.current, name)) {
            innerErrors.current[name] = false
          }
        }
      })

      // NOTE: 保持外部的 errors 信息一致
      registerError((errors) => {
        const resErrors: Record<string, any> = { ...errors }
        Object.keys(innerErrors.current).forEach((name) => {
          const value = innerErrors.current[name]
          if (value) {
            Object.assign(resErrors, { [name]: value })
          } else {
            delete resErrors[name]
          }
        })

        return resErrors
      })
    } else {
      throw new Error('blur, input 时校验的数据需要 registerError 函数才能捕获')
    }
  }
  // DONE: 收集所有的 formItem 的 rule 的规则集
  const collectFieldItem = (
    rule: Rules,
    name: string,
    checkMode?: CheckMode
  ) => {
    setRules((v) => ({ ...v, ...rule }))

    // 优先级 fieldItem > form > normal
    setCheckModes((v) => ({
      ...v,
      ...{ [name]: checkMode || props.checkMode || 'submit' },
    }))
  }

  // DONE: 删除 Field Item 的 rule，当联动显示隐藏时需要处理下
  const deleteFieldItem = (name: string) => {
    setRules((v) => {
      if (v) {
        const { ...rulesCopy } = v
        delete rulesCopy[name]
        return rulesCopy
      }
    })
    innerErrors.current[name] = false
  }

  // DONE: 将 ref 实例传递给父组件，useImperativeHandle 和 forwardRef 一起使用
  useImperativeHandle(ref, () => ({
    values,
  }))

  const checkFieldItem = (itemData: any) => {
    let res: Record<string, string | boolean> = {}
    const [name, value] = singleObjToArray(itemData)
    if (Object.prototype.hasOwnProperty.call(rules, name) && rules) {
      const rule = rules[name]
      for (let i = 0; i < rule.length; i += 1) {
        const item = rule[i]
        const keys = Object.keys(item) //
        const ruleType = keys[0]
        if (ruleType === 'required' && (item as RequireRule)[ruleType]) {
          if (!value) {
            res = { [name]: item.message }
            break
          } else {
            res = { [name]: false }
          }
        } else if (ruleType === 'pattern' && (item as PatternRule)[ruleType]) {
          const ruleMethod = (item as PatternRule)[ruleType]
          if (typeof ruleMethod === 'function') {
            if (!ruleMethod(value)) {
              res = { [name]: item.message }
              break
            } else {
              res = { [name]: false }
            }
          } else {
            if (!(ruleMethod as RegExp).test(value)) {
              res = { [name]: item.message }
              break
            } else {
              res = { [name]: false }
            }
          }
        } else if (
          ['min', 'max', 'minLength', 'maxLength'].indexOf(ruleType) > -1
        ) {
          switch (ruleType) {
            case 'min':
              if (typeof value === 'number') {
                if (value > (item as RangeMinRule)[ruleType]) {
                  res = { [name]: false }
                } else {
                  res = { [name]: item.message }
                  break
                }
              } else {
                throw new Error(`当前输入值不是数字，${ruleType}无效`)
              }
              break
            case 'max':
              if (typeof value === 'number') {
                if (value < (item as RangeMaxRule)[ruleType]) {
                  res = { [name]: false }
                } else {
                  res = { [name]: item.message }
                  break
                }
              } else {
                throw new Error(`当前输入值不是数字，${ruleType}无效`)
              }
              break
            case 'minLength':
              if (typeof value === 'string') {
                if (value.length > (item as RangeMinLengthRule)[ruleType]) {
                  res = { [name]: false }
                } else {
                  res = { [name]: item.message }
                  break
                }
              } else {
                throw new Error(`当前输入值不是字符串，${ruleType}无效`)
              }
              break
            case 'maxLength':
              if (typeof value === 'string') {
                if (value.length < (item as RangeMaxLengthRule)[ruleType]) {
                  res = { [name]: false }
                } else {
                  res = { [name]: item.message }
                  break
                }
              } else {
                throw new Error(`当前输入值不是字符串，${ruleType}无效`)
              }
              break
            default:
              break
          }
        }
      }
    }
    return res
  }
  const handleSubmit = () => {
    // DONE: 判断是否有校验规则
    if (!rules) {
      onSubmit(values)
    } else {
      if (!props.registerError) {
        const errors:ErrorsType = {}
        Object.keys(rules).forEach((item) => {
          const errorInfo = checkFieldItem({ [item]: values[item] })
          // DONE: 收集错误信息
          if (errorInfo[item]) {
            errors[item] = errorInfo[item]
          }
        })
        // console.log('-- 提交时校验全部', errors)
        if (Object.keys(errors).length === 0) {
          onSubmit(values)
        } else {
          onSubmitFailed && onSubmitFailed(errors)
        }
      } else {
        // DONE: 校验是否还有未检查的数据
        if (
          Object.keys(innerErrors.current).length === Object.keys(rules).length
        ) {
          // DONE: 判断里面是否有错误
          if (Object.values(innerErrors.current).every((item) => !item)) {
            onSubmit(values)
          } else {
            onSubmitFailed && onSubmitFailed(innerErrors.current)
          }
        } else {
          // 只校验 blur, input 以外的规则
          const others = Object.keys(rules).filter(
            (item) => !Object.keys(innerErrors.current).includes(item)
          )
          // DONE: 合并触发
          const errors = {}
          others.forEach((item) =>
            Object.assign(
              errors,
              checkFieldItem({ [item]: (values as Record<string, any>)[item] })
            )
          )

          if (Object.keys(errors).length === 0) {
            onSubmit(values)
          } else {
            onSubmitFailed && onSubmitFailed(errors)
          }
        }
      }
    }
  }

  const handleInput = (value: any) => {
    // TODO:当前的输入校验模式是否是 input
    const [name] = singleObjToArray(value)
    if ((checkModes as Record<string, string>)[name] === 'input' && rules) {
      setErrors(checkFieldItem(value))
    }
    setValues({ ...values, ...value })
  }

  const handleBlur = (value: any) => {
    const [name] = singleObjToArray(value)

    if ((checkModes as Record<string, string>)[name] === 'blur' && rules) {
      setErrors(checkFieldItem(value))
    }
  }

  return (
    <FormContext.Provider
      value={{
        handleInput,
        handleBlur,
        collectFieldItem,
        deleteFieldItem,
        formValues: values,
        onSubmit: handleSubmit,
      }}
    >
      <form>{children}</form>
    </FormContext.Provider>
  )
}

export default forwardRef(AForm)
