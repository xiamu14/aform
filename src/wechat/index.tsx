import React, { useState, forwardRef, useImperativeHandle } from "react";
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

const Form: React.ForwardRefRenderFunction<
  {},
  React.PropsWithChildren<Props>
> = (props, ref) => {
  const { onSubmit, children } = props;
  const [data, setData] = useState<Data>();
  const [rules, setRules] = useState<Rules>();
  const [checkModes, setCheckModes] = useState({});

  const setErrors = (error: Record<string, any>) => {
    const { registerError } = props;
    const [name, value] = singleObjToArray(error);

    if (registerError) {
      value
        ? registerError((errors) => {
            return { ...errors, ...error };
          })
        : registerError((errors) => {
            const errorsTmp = { ...errors };
            if (Object.prototype.hasOwnProperty.call(errorsTmp, name)) {
              delete (errorsTmp as Record<string, any>)[name];
            }

            return errorsTmp;
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
    setData((v) => ({ ...v, ...{ [name]: "" } }));
    // 优先级 fieldItem > form > normal
    setCheckModes((v) => ({
      ...v,
      ...{ [name]: checkMode || props.checkMode || "blur" },
    }));
  };

  // DONE: 将 ref 实例传递给父组件，useImperativeHandle 和 forwardRef 一起使用
  useImperativeHandle(ref, () => ({
    action: {},
  }));
  const checkFieldItem = (itemData: any) => {
    let tag = true;
    const [name, value] = singleObjToArray(itemData);
    // console.log("检查下啊", rules);
    if (Object.prototype.hasOwnProperty.call(rules, name) && rules) {
      const rule = rules[name];
      rule.forEach((item) => {
        const keys = Object.keys(item); //
        const ruleType = keys[0];
        if (ruleType === "required" && (item as RequireRule)[ruleType]) {
          if (!value) {
            setErrors({ [name]: item.message });
            tag = false;
          } else {
            setErrors({ [name]: false });
          }
        } else if (ruleType === "pattern" && (item as PatternRule)[ruleType]) {
          const ruleMethod = (item as PatternRule)[ruleType];
          if (typeof ruleMethod === "function") {
            if (!ruleMethod(value)) {
              setErrors({ [name]: item.message });
              tag = false;
            } else {
              setErrors({ [name]: false });
            }
          } else {
            if (!(ruleMethod as RegExp).test(value)) {
              setErrors({ [name]: item.message });
              tag = false;
            } else {
              setErrors({ [name]: false });
            }
          }
        } else if (
          ["min", "max", "minLength", "maxLength"].indexOf(ruleType) > -1
        ) {
          switch (ruleType) {
            case "min":
              if (typeof value === "number") {
                if (value > (item as RangeMinRule)[ruleType]) {
                  setErrors({ [name]: false });
                } else {
                  tag = false;
                  setErrors({ [name]: item.message });
                }
              } else {
                throw new Error(`当前输入值类似不是数字，${ruleType}无效`);
              }
              break;
            case "max":
              if (typeof value === "number") {
                if (value < (item as RangeMaxRule)[ruleType]) {
                  setErrors({ [name]: false });
                } else {
                  tag = false;
                  setErrors({ [name]: item.message });
                }
              } else {
                throw new Error(`当前输入值类似不是数字，${ruleType}无效`);
              }
              break;
            case "minLength":
              if (typeof value === "string") {
                if (value.length > (item as RangeMinLengthRule)[ruleType]) {
                  setErrors({ [name]: false });
                } else {
                  tag = false;
                  setErrors({ [name]: item.message });
                }
              } else {
                throw new Error(`当前输入值类似不是字符串，${ruleType}无效`);
              }
              break;
            case "maxLength":
              if (typeof value === "string") {
                if (value.length < (item as RangeMaxLengthRule)[ruleType]) {
                  setErrors({ [name]: false });
                } else {
                  tag = false;
                  setErrors({ [name]: item.message });
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
    return tag;
  };
  const handleSubmit = () => {
    // DONE: 判断是否有不合法的数据
    let tag = true;
    if (data) {
      Object.keys(data).forEach((key) => {
        tag = checkFieldItem({ [key]: data[key] });
      });
      if (tag) {
        onSubmit(data);
      }
    }
  };

  const handleInput = (itemData: any) => {
    // TODO:当前的输入校验模式是否是 input
    const [name] = singleObjToArray(itemData);
    if ((checkModes as Record<string, string>)[name] === "input") {
      checkFieldItem(itemData);
    }
    setData({ ...data, ...itemData });
  };

  const handleBlur = (itemData: any) => {
    const [name] = singleObjToArray(itemData);
    if ((checkModes as Record<string, string>)[name] === "blur") {
      checkFieldItem(itemData);
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
