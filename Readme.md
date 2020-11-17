<div align=center><img width="150" height="150" src="https://assets-phi.vercel.app/aform/form-logo.svg" /></div>

## AForm

基于微信小程序类 React 框架 [Remax](https://remaxjs.org/) 的轻量级表单库

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

## 背景

表单问题，不管是在 jQuery 时代，还是 React，Vue 时代，都一直存在，微信小程序更是如此。目前传统的表单开发方式：

1. 手动管理表单状态
2. 手动收集表单数据
3. 手动管理表单校验状态

带来的问题：

1. 表单数量大而复杂的时候，每个表单域都要手动绑定 value/onChange ，造成代码冗余
2. 表单数据校验缺乏简单而统一的方式，需要手动逐个处理，增加工作量

## 实战

### 绑定表单域

从下面简单场景中理解如何绑定表单域
![注册页面](https://assets-phi.vercel.app/aform/00.png)

```javascript
import { View, Text, Image, Input, Label } from "remax/wechat";
import {
  ReForm as Form,
  ReField as Field,
  ReSubmit as Submit,
} from "@redchili/aform";

<View className={styles.formBox}>
  <Form onSubmit={(data) => console.log(data)}>
    <Field name="nickname">
      {" "}
      // name 属性必须是唯一标识
      <Input placeholder="请输入昵称" className={styles.fieldInputText}></Input>
    </Field>
    <Field name="password">
      <Input placeholder="请输入密码" className={styles.fieldInputText}></Input>
    </Field>
    <Field name="rePassword">
      <Input placeholder="请输入密码" className={styles.fieldInputText}></Input>
    </Field>
    <Submit className={styles.btnSubmit}>注册</Submit>
  </Form>
</View>;
```

```css
.app {
  text-align: center;
  padding: 0 24px;
}

.formBox {
  position: relative;
  width: 600px;
  height: 500px;
  background: white;
  border-radius: 20px;
  box-shadow: rgba(17, 12, 46, 0.15) 0px 48px 100px 0px;
  margin: 40px auto 0;
  box-sizing: border-box;
  padding: 40px;
}

.btnSubmit {
  position: absolute;
  bottom: -40px;
  left: 65px;
  background: rgba(79, 128, 242, 1);
  width: 460px;
  height: 80px;
  border-radius: 40px;
  color: white;
  line-height: 80px;
  font-size: 28px;
}

.fieldLabel {
  margin-bottom: 12px;
  font-size: 26px;
  color: #666666;
}
.fieldInputText {
  height: 100px;
  padding: 0 12px;
  margin-bottom: 40px;
  border-bottom: 1px solid rgba(17, 12, 46, 0.15);
}
```

表单域组件绑定

- Field 组件 props 里的 name 是表单域组件在表单里的唯一标识，不可重名。
- Field 的 child 可以是任意实现了 props 包含 value 和 onInput 属性的表单组件，Form 组件会通过 context （具体实现请查阅源码）实现自动绑定数据，自动收集表单组件的输入。
- AForm 库不实现任何包含 UI 的表单域组件，开发者可以根据业务需要，设置样式。

### 自定义表单域

在实际业务开发中，经常会需要封装逻辑，样式一致的表单域组件。如下面的 InputBase:

```javascript
function InputBase(props) {
  return (
    <View>
      <Label className={styles.fieldLabel}>{props.label}</Label>
      <Input
        className={styles.fieldInputText}
        value={props.value}
        onInput={props.onInput}
      ></Input>
    </View>
  );
}
```

> InputBase 里需要手动绑定 value， onInput。但具体逻辑不需要业务侧实现，AForm 内部会根据绑定信息，将正确的 value 和 onInput 传递。

实际使用代码如下：

```javascript
<Form onSubmit={(data) => console.log(data)} registerError={setErrors}>
  <Field name="nickname" rule={[{ required: true, message: "请输入呢称" }]}>
    {/* @ts-ignore */}
    <InputBase label="昵称:"></InputBase>
  </Field>
  <Field name="password" rule={[{ required: true, message: "请输入密码" }]}>
    {/* @ts-ignore */}
    <InputBase label="密码:"></InputBase>
  </Field>
  <Field name="rePassword" rule={[{ required: true, message: "请输入密码" }]}>
    {/* @ts-ignore */}
    <InputBase label="重复密码:"></InputBase>
  </Field>
  <Submit className={styles.btnSubmit}>注册</Submit>
</Form>
```

> 如果项目里使用的 typescript，那么在使用 InputBase 时，由于 typescript 会检查 InputBase props 需要传入 value，onInput ，而实际上 AForm 会自动传入，所以这里需要添加
> ts-ignore 。但这样的问题是会关闭表单域组件的类型校验，所以 Field 提供了另一种折中的方式。

Field 提供了 component 属性用于手动绑定封装的自定义表单域组件。component 需要传入一个函数，该函数返回表单域组件。示例代码如下：

```javascript
<Field<InputBaseProps>
  name="nickname"
  rule={[{ required: true, message: "请输入呢称" }]}
  component={InputBase}
  xProps={{ label: "昵称" }}
></Field>
```
- component 属性用于传递表单域组件，xProps 用于传入表单域组件除 value,onInput 以外的 props 属性
- Field 接受一个泛型，用于校验 xProps 。

### 校验数据

### 捕获错误

### 提交请求
