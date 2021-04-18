import React, { useContext, useEffect, Attributes, useState } from 'react'
import { FormContext } from '../context'
import { CheckMode, Remove, Rule } from '../types'

interface Props<T> {
  name: string
  className?: string
  style?: Record<string, string>
  checkMode?: CheckMode // 校验的模式，默认 input
  rule?: Rule[]
  // eslint-disable-next-line
  component?: (props: {
    value: any
    values: any
    // eslint-disable-next-line
    onInput: (value: any) => void
    // eslint-disable-next-line
    onBlur: (value: any) => void
  }) => JSX.Element // 支持外部函数
  /** @deprecated */
  xProps?: Remove<T, 'value' | 'onInput' | 'onBlur'> // 外部组件的 props
  effect?: { isShow: (data: any) => boolean }
}

const Field = <T extends Attributes>(
  props: React.PropsWithChildren<Props<T>>
) => {
  const {
    children,
    checkMode,
    className,
    style,
    component,
    name,
    effect,
    rule,
  } = props
  const context = useContext(FormContext)
  const {
    collectFieldItem,
    formValues,
    handleInput,
    handleBlur,
    deleteFieldItem,
  } = context

  const [isShow, setIsShow] = useState(true)

  useEffect(() => {
    if (effect) {
      setIsShow(effect.isShow(formValues))
    }
    // eslint-disable-next-line
  }, [formValues])

  useEffect(() => {
    if (rule && isShow) {
      // console.log('收集字段域校验规则', name)
      collectFieldItem({ [name]: rule }, name, checkMode)
    }
    // eslint-disable-next-line
  }, [rule])

  useEffect(() => {
    if (!isShow) {
      // console.log('删除字段域校验规则', name)
      deleteFieldItem(name)
    } else {
      // TODO: 这里应该限制初始状态不执行的
      if (rule) {
        collectFieldItem({ [name]: rule }, name, checkMode)
      }
    }
    // eslint-disable-next-line
  }, [isShow])

  const handleFn = (
    type: 'blur' | 'input',
    name: string,
    value: InputEvent | any
  ) => {
    let itemValue: Record<string, any>

    // TODO: 这一段从原生组件 event 里取数需要做更多的兼容
    if (typeof value === 'object' && value.detail) {
      itemValue = { [name]: value.detail.value }
    } else {
      itemValue = { [name]: value }
    }
    // ---------------------------------------------

    switch (type) {
      case 'blur':
        handleBlur(itemValue)
        break
      case 'input':
        handleInput(itemValue)
      default:
        break
    }
  }

  const bind = (child: React.ReactNode) => {
    if (!React.isValidElement(child)) {
      return null
    }
    // DONE: 判断 ReactNode 是否是 function(input 是这个类型， label 不是这个类型，还需要看其他自定义组件时类型是什么)
    // if (typeof child.type === "function") {
    const childProps = {
      ...child.props,
      ...{
        value: formValues && formValues[name],
        Values: formValues,
        onBlur: (itemValue: any) => {
          handleFn('blur', name, itemValue)
        },
        onInput: (itemValue: any) => {
          handleFn('input', name, itemValue)
        },
      },
    }
    return React.cloneElement(child, childProps)
  }

  const custom = () => {
    return component
      ? component({
          value: formValues && formValues[name],
          values: formValues,
          onBlur: (itemValue: any) => {
            handleFn('blur', name, itemValue)
          },
          onInput: (itemValue: any) => {
            handleFn('input', name, itemValue)
          },
        })
      : null
  }

  return isShow ? (
    <>
      {component ? custom() : React.Children.map(children, bind)}
    </>
  ) : null
}

export default React.memo(Field)
