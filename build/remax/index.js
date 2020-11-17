import React, { useState, forwardRef, useImperativeHandle } from "react";
import { Form as ReForm } from "remax/one";
import { FormContext } from "./context";
import { singleObjToArray } from "../util/single_obj_to_array";
const Form = (props, ref) => {
    const { onSubmit, children } = props;
    const [data, setData] = useState();
    const [rules, setRules] = useState();
    const [checkModes, setCheckModes] = useState({});
    const setErrors = (error) => {
        const { registerError } = props;
        const [name, value] = singleObjToArray(error);
        if (registerError) {
            value
                ? registerError((errors) => {
                    return Object.assign(Object.assign({}, errors), error);
                })
                : registerError((errors) => {
                    const errorsTmp = Object.assign({}, errors);
                    if (Object.prototype.hasOwnProperty.call(errorsTmp, name)) {
                        delete errorsTmp[name];
                    }
                    return errorsTmp;
                });
        }
    };
    // DONE: 收集所有的 formItem 的 rule 的规则集
    const collectFieldItem = (rule, name, checkMode) => {
        setRules((v) => (Object.assign(Object.assign({}, v), rule)));
        setData((v) => (Object.assign(Object.assign({}, v), { [name]: "" })));
        // 优先级 fieldItem > form > normal
        setCheckModes((v) => (Object.assign(Object.assign({}, v), { [name]: checkMode || props.checkMode || "blur" })));
    };
    // DONE: 将 ref 实例传递给父组件，useImperativeHandle 和 forwardRef 一起使用
    useImperativeHandle(ref, () => ({
        action: {},
    }));
    const checkFieldItem = (itemData) => {
        let tag = true;
        const [name, value] = singleObjToArray(itemData);
        // console.log("检查下啊", rules);
        if (Object.prototype.hasOwnProperty.call(rules, name) && rules) {
            const rule = rules[name];
            rule.forEach((item) => {
                const keys = Object.keys(item); //
                const ruleType = keys[0];
                if (ruleType === "required" && item[ruleType]) {
                    if (!value) {
                        setErrors({ [name]: item.message });
                        tag = false;
                    }
                    else {
                        setErrors({ [name]: false });
                    }
                }
                else if (ruleType === "pattern" && item[ruleType]) {
                    const ruleMethod = item[ruleType];
                    if (typeof ruleMethod === "function") {
                        if (!ruleMethod(value)) {
                            setErrors({ [name]: item.message });
                            tag = false;
                        }
                        else {
                            setErrors({ [name]: false });
                        }
                    }
                    else {
                        if (!ruleMethod.test(value)) {
                            setErrors({ [name]: item.message });
                            tag = false;
                        }
                        else {
                            setErrors({ [name]: false });
                        }
                    }
                }
                else if (["min", "max", "minLength", "maxLength"].indexOf(ruleType) > -1) {
                    switch (ruleType) {
                        case "min":
                            if (typeof value === "number") {
                                if (value > item[ruleType]) {
                                    setErrors({ [name]: false });
                                }
                                else {
                                    tag = false;
                                    setErrors({ [name]: item.message });
                                }
                            }
                            else {
                                throw new Error(`当前输入值类似不是数字，${ruleType}无效`);
                            }
                            break;
                        case "max":
                            if (typeof value === "number") {
                                if (value < item[ruleType]) {
                                    setErrors({ [name]: false });
                                }
                                else {
                                    tag = false;
                                    setErrors({ [name]: item.message });
                                }
                            }
                            else {
                                throw new Error(`当前输入值类似不是数字，${ruleType}无效`);
                            }
                            break;
                        case "minLength":
                            if (typeof value === "string") {
                                if (value.length > item[ruleType]) {
                                    setErrors({ [name]: false });
                                }
                                else {
                                    tag = false;
                                    setErrors({ [name]: item.message });
                                }
                            }
                            else {
                                throw new Error(`当前输入值类似不是字符串，${ruleType}无效`);
                            }
                            break;
                        case "maxLength":
                            if (typeof value === "string") {
                                if (value.length < item[ruleType]) {
                                    setErrors({ [name]: false });
                                }
                                else {
                                    tag = false;
                                    setErrors({ [name]: item.message });
                                }
                            }
                            else {
                                throw new Error(`当前输入值类似不是字符串，${ruleType}无效`);
                            }
                            break;
                        default:
                            break;
                    }
                }
                else {
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
    const handleInput = (itemData) => {
        // TODO:当前的输入校验模式是否是 input
        const [name] = singleObjToArray(itemData);
        if (checkModes[name] === "input") {
            checkFieldItem(itemData);
        }
        setData(Object.assign(Object.assign({}, data), itemData));
    };
    const handleBlur = (itemData) => {
        const [name] = singleObjToArray(itemData);
        if (checkModes[name] === "blur") {
            checkFieldItem(itemData);
        }
    };
    return (React.createElement(FormContext.Provider, { value: {
            handleInput,
            handleBlur,
            collectFieldItem,
            formData: data,
            onSubmit: handleSubmit,
        } },
        React.createElement(ReForm, null, children)));
};
export default forwardRef(Form);
