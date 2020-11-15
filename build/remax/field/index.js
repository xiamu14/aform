import React, { useContext, useEffect } from "react";
import { View } from "remax/one";
import { FormContext } from "../context";
export default function Field(props) {
    const { children, checkMode, className, style, component, xProps, name, } = props;
    const { collectFieldItem, formData, handleInput, handleBlur } = useContext(FormContext);
    useEffect(() => {
        const { rule } = props;
        if (rule) {
            collectFieldItem({ [name]: rule }, name, checkMode);
        }
    }, []);
    const handleFn = (type, name, value) => {
        let itemValue;
        if (typeof value === "object" && value.detail) {
            itemValue = { [name]: value.detail.value };
        }
        else {
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
    const bind = (child) => {
        if (!React.isValidElement(child)) {
            return null;
        }
        // DONE: 判断 ReactNode 是否是 function(input 是这个类型， label 不是这个类型，还需要看其他自定义组件时类型是什么)
        // if (typeof child.type === "function") {
        const childProps = Object.assign(Object.assign({}, child.props), {
            value: formData && formData[name],
            onBlur: (itemValue) => {
                handleFn("blur", name, itemValue);
            },
            onInput: (itemValue) => {
                handleFn("input", name, itemValue);
            },
        });
        return React.cloneElement(child, childProps);
        // }
        // else {
        //   return child;
        // }
    };
    return (React.createElement(View, { className: className, style: style }, component
        ? bind(React.createElement(component, xProps))
        : React.Children.map(children, bind)));
}
