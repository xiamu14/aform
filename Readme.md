<div align=center><img width="150" height="150" src="https://assets-phi.vercel.app/aform/form-logo.svg" /></div>

## AForm

支持移动端网页和微信小程序的轻量级表单框架

## 特点

- 自动绑定表单域，用于收集输入数据，无需手动声明 'onChange'、'onBlur' 等方法
- 简化校验数据的方式，内置常用的校验规则，比如：必填/可选，最大值，正则判断手机号等
- 样式无关，AForm 只负责处理表单的收集数据，校验数据，提交数据的逻辑，表单的样式由开发者自定义

## 安装

`yarn add @redchili/aform`

## 示例【Remax】

```javascript
import * as React from "react";
import { useState, useEffect } from "react";
import { View, Text, Image, Input, Label } from "remax/wechat";
import {
  ReForm as Form,
  ReField as Field,
  ReSubmit as Submit,
} from "@redchili/aform";
import styles from "./index.css";

function InputBase(props) {
  return (
    <View>
      <Label>test</Label>
      <Input value={props.value} onInput={props.onInput}></Input>
    </View>
  );
}

export default () => {
  const [errors, setErrors] = useState();
  useEffect(() => {
    console.log("check", errors);
  }, [errors]);
  return (
    <View className={styles.app}>
      <Form onSubmit={(data) => console.log(data)} registerError={setErrors}>
        <Field
          name="test"
          rule={[{ required: true, message: "请输入测试数据" }]}
          component={InputBase}
        ></Field>
        <Submit>test</Submit>
      </Form>
    </View>
  );
};
```

## 实战

### 绑定表单域

### 自定义表单域

### 校验数据

### 捕获错误

### 提交请求
