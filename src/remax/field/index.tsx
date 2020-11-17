import React, {
  useContext,
  useEffect,
  FunctionComponent,
  Attributes,
} from "react";
import { View } from "remax/one";
import { FormContext } from "../context";

export interface RangeMinRule {
  min: number;
  message: string;
}

export interface RangeMaxRule {
  max: number;
  message: string;
}

export interface RangeMinLengthRule {
  minLength: number;
  message: string;
}

export interface RangeMaxLengthRule {
  maxLength: number;
  message: string;
}

export interface RequireRule {
  required: boolean;
  message: string;
}

export interface PatternRule {
  pattern: RegExp | ((value: any) => boolean);
  message: string;
}

export type Rule =
  | RequireRule
  | PatternRule
  | RangeMinRule
  | RangeMaxRule
  | RangeMinLengthRule
  | RangeMaxLengthRule;

type Remove<T, K> = {
  [P in Exclude<keyof T, K>]: T[P];
};

interface Props<T> {
  name: string;
  className?: string;
  style?: Record<string, string>;
  checkMode?: "blur" | "input"; // 校验的模式，默认 input
  rule?: Rule[];
  component?: FunctionComponent; // 支持外部函数
  xProps?: Remove<T, "value" | "onInput" | "onBlur">; // 外部组件的 props
}

export default function Field<T extends Attributes>(
  props: React.PropsWithChildren<Props<T>>
) {
  const {
    children,
    checkMode,
    className,
    style,
    component,
    xProps,
    name,
  } = props;
  const { collectFieldItem, formData, handleInput, handleBlur } = useContext(
    FormContext
  );

  useEffect(() => {
    const { rule } = props;
    if (rule) {
      collectFieldItem({ [name]: rule }, name, checkMode);
    }
  }, []);

  const handleFn = (
    type: "blur" | "input",
    name: string,
    value: InputEvent | any
  ) => {
    let itemValue: Record<string, any>;
    if (typeof value === "object" && value.detail) {
      itemValue = { [name]: value.detail.value };
    } else {
      itemValue = { [name]: value };
    }
    switch (type) {
      case "blur":
        handleBlur(itemValue);
        break;
      case "input":
        handleInput(itemValue);
      default:
        break;
    }
  };

  const bind = (child: React.ReactNode) => {
    if (!React.isValidElement(child)) {
      return null;
    }
    // DONE: 判断 ReactNode 是否是 function(input 是这个类型， label 不是这个类型，还需要看其他自定义组件时类型是什么)
    // if (typeof child.type === "function") {
    const childProps = {
      ...child.props,
      ...{
        value: formData && formData[name],
        onBlur: (itemValue: any) => {
          handleFn("blur", name, itemValue);
        },
        onInput: (itemValue: any) => {
          handleFn("input", name, itemValue);
        },
      },
    };
    return React.cloneElement(child, childProps);
    // }
    // else {
    //   return child;
    // }
  };

  return (
    <View className={className} style={style}>
      {component
        ? bind(React.createElement(component, xProps))
        : React.Children.map(children, bind)}
    </View>
  );
}
