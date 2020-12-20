import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { Form as ReForm } from "remax/wechat";
import { FormContext } from "./context";
import {
  Rule,
  RequireRule,
  PatternRule,
  RangeMinRule,
  RangeMaxRule,
  RangeMinLengthRule,
  RangeMaxLengthRule,
} from "./field";
import { singleObjToArray } from "../util/single_obj_to_array";

type Data = Record<string, string | number>;

interface Props {
  onSubmit: (data?: Data) => void;
  registerError?: React.Dispatch<React.SetStateAction<{}>>;
  initialValues?: Data; // NOTE: 组件动态初始值
  checkMode?: "blur" | "input"; // NOTE: 全局校验模式
}

type Rules = Record<string, Rule[]>;

export interface FormRefType {
  values?: Data;
}

const Form: React.ForwardRefRenderFunction<
  FormRefType,
  React.PropsWithChildren<Props>
> = (props, ref) => {
  const { onSubmit, children, initialValues } = props;
  const [data, setData] = useState<Data>(initialValues ?? {});
  const [rules, setRules] = useState<Rules>();
  const [checkModes, setCheckModes] = useState({});

  const innerErrors = useRef<Record<string, any>>({});

  const setErrors = (errors: Record<string, any>) => {
    const { registerError } = props;
    if (registerError) {
      Object.keys(errors).forEach((name) => {
        const value = errors[name];
        const error = { [name]: value };
        if (value) {
          Object.assign(innerErrors.current, error);
        } else {
          if (Object.prototype.hasOwnProperty.call(innerErrors.current, name)) {
            innerErrors.current[name] = false;
          }
        }
      });
      registerError((errors) => {
        const resErrors: Record<string, any> = { ...errors };
        Object.keys(innerErrors.current).forEach((name) => {
          const value = innerErrors.current[name];
          if (value) {
            Object.assign(resErrors, { [name]: value });
          } else {
            delete resErrors[name];
          }
        });
        return resErrors;
      });
    }
  };
  // DONE: 收集所有的 formItem 的 rule 的规则集
  const collectFieldItem = (
    rule: Rules,
    name: string,
    checkMode: "input" | "blur"
  ) => {
    setRules((v) => ({ ...v, ...rule }));
    // setData((v) => ({ ...v, ...{ [name]: initialValues ? initialValues[name] : "" } }));
    // 优先级 fieldItem > form > normal
    setCheckModes((v) => ({
      ...v,
      ...{ [name]: checkMode || props.checkMode || "blur" },
    }));
  };

  // DONE: 将 ref 实例传递给父组件，useImperativeHandle 和 forwardRef 一起使用
  useImperativeHandle(ref, () => ({
    values: data,
  }));
  const checkFieldItem = (itemData: any) => {
    let res: Record<string, string | boolean> = {};
    const [name, value] = singleObjToArray(itemData);
    if (Object.prototype.hasOwnProperty.call(rules, name) && rules) {
      const rule = rules[name];
      rule.forEach((item) => {
        const keys = Object.keys(item); //
        const ruleType = keys[0];
        if (ruleType === "required" && (item as RequireRule)[ruleType]) {
          if (!value) {
            res = { [name]: item.message };
          } else {
            res = { [name]: false };
          }
        } else if (ruleType === "pattern" && (item as PatternRule)[ruleType]) {
          const ruleMethod = (item as PatternRule)[ruleType];
          if (typeof ruleMethod === "function") {
            if (!ruleMethod(value)) {
              res = { [name]: item.message };
            } else {
              res = { [name]: false };
            }
          } else {
            if (!(ruleMethod as RegExp).test(value)) {
              res = { [name]: item.message };
            } else {
              res = { [name]: false };
            }
          }
        } else if (
          ["min", "max", "minLength", "maxLength"].indexOf(ruleType) > -1
        ) {
          switch (ruleType) {
            case "min":
              if (typeof value === "number") {
                if (value > (item as RangeMinRule)[ruleType]) {
                  res = { [name]: false };
                } else {
                  res = { [name]: item.message };
                }
              } else {
                throw new Error(`当前输入值类似不是数字，${ruleType}无效`);
              }
              break;
            case "max":
              if (typeof value === "number") {
                if (value < (item as RangeMaxRule)[ruleType]) {
                  res = { [name]: false };
                } else {
                  res = { [name]: item.message };
                }
              } else {
                throw new Error(`当前输入值类似不是数字，${ruleType}无效`);
              }
              break;
            case "minLength":
              if (typeof value === "string") {
                if (value.length > (item as RangeMinLengthRule)[ruleType]) {
                  res = { [name]: false };
                } else {
                  res = { [name]: item.message };
                }
              } else {
                throw new Error(`当前输入值类似不是字符串，${ruleType}无效`);
              }
              break;
            case "maxLength":
              if (typeof value === "string") {
                if (value.length < (item as RangeMaxLengthRule)[ruleType]) {
                  res = { [name]: false };
                } else {
                  res = { [name]: item.message };
                }
              } else {
                throw new Error(`当前输入值类似不是字符串，${ruleType}无效`);
              }
              break;
            default:
              break;
          }
        } else {
          throw new Error(`${ruleType}是无效的校验规则`);
        }
      });
    }
    return res;
  };
  const handleSubmit = () => {
    // DONE: 判断是否有不合法的数据
    if (!rules) {
      onSubmit(data);
    } else {
      if (
        Object.keys(innerErrors.current).length === Object.keys(rules).length &&
        Object.values(innerErrors.current).every((item) => !item)
      ) {
        onSubmit(data);
      }
      if (Object.keys(innerErrors.current).length < Object.keys(rules).length) {
        // 只校验必要的规则
        const others = Object.keys(rules).filter(
          (item) => !Object.keys(innerErrors.current).includes(item)
        );

        // TODO: 合并触发
        const errors = {};
        others.forEach((item) =>
          Object.assign(
            errors,
            checkFieldItem({ [item]: (data as Record<string, any>)[item] })
          )
        );
        setErrors(errors);
      }
    }
  };

  const handleInput = (itemData: any) => {
    // TODO:当前的输入校验模式是否是 input
    const [name] = singleObjToArray(itemData);
    if ((checkModes as Record<string, string>)[name] === "input" && rules) {
      setErrors(checkFieldItem(itemData));
    }
    setData({ ...data, ...itemData });
  };

  const handleBlur = (itemData: any) => {
    const [name] = singleObjToArray(itemData);

    if ((checkModes as Record<string, string>)[name] === "blur" && rules) {
      setErrors(checkFieldItem(itemData));
    }
  };

  return (
    <FormContext.Provider
      value={{
        handleInput,
        handleBlur,
        collectFieldItem,
        formData: data,
        onSubmit: handleSubmit,
      }}
    >
      <ReForm>{children}</ReForm>
    </FormContext.Provider>
  );
};

export default forwardRef(Form);
