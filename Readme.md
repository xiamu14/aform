<div align=center><img width="150" height="150" src="https://assets-phi.vercel.app/aform/form-logo.svg" /></div>

## AForm

基于微信小程序类 React 框架 [Remax](https://remaxjs.org/) 的轻量级表单库

## 背景

表单问题，不管是在 jQuery 时代，还是 React，Vue 时代，都一直存在，微信小程序更是如此。目前传统的表单开发方式：

1. 手动管理表单状态
2. 手动收集表单数据
3. 手动管理表单校验状态

带来的问题：

1. 表单数量大而复杂的时候，每个表单域都要手动绑定 value/onChange ，造成代码冗余
2. 表单数据校验缺乏简单而统一的方式，需要手动逐个处理，增加工作量

## 特点

- 自动绑定表单域，用于收集输入数据，无需手动声明 'onChange'、'onBlur' 等方法
- 简化校验数据的方式，内置常用的校验规则，比如：必填/可选，最大值，正则判断手机号等
- 样式无关，AForm 只负责处理表单的收集数据，校验数据，提交数据的逻辑，表单的样式由开发者自定义
- 使用 Typescript，具有完整准确的类型提示

## 安装

`yarn add @redchili/aform`

## 示例【Remax】

### 快速入门

```javascript
import React, { useState, useEffect } from "react";
import { View, Text, Image, Input, Label } from "remax/wechat";
import { Form, Field, Submit } from "@redchili/aform";
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
  return (
    <View className={styles.app}>
      <Form onSubmit={(data) => console.log(data)}>
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

### 更多场景示例

## 循序渐进的教程

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
> ts-ignore 。但这样的问题是会关闭表单域组件的类型校验，所以 Field 提供了另一种方式。

> 推荐使用 component 的方式定义表单域组件

Field 提供了 component 属性用于手动绑定封装的自定义表单域组件。component 需要传入一个函数，该函数返回表单域组件。示例代码如下：

```javascript
<Field<InputBaseProps>
  name="nickname"
  rule={[{ required: true, message: "请输入呢称" }]}
  component={({value, onInput})=><InputBase value={value} onInput={onInput} />}
  xProps={{ label: "昵称" }}
></Field>
```

- component 属性用于传递表单域组件，xProps 用于传入表单域组件除 value,onInput 以外的 props 属性
- Field 接受一个泛型，用于校验 xProps(已废弃，兼容旧版本) 。

### 校验数据

AForm 支持下面的校验规则：

- required (必填)
- min （数字最小值）
- max （数字最大值）
- minLength (字符串最小长度)
- maxLength (字符串最小长度)
- pattern (正则校验或自定义校验函数)

规则对象描述如下：

```javascript
<Field name="password" rule={[{ required: true, message: "请输入密码" }]}>
  {/* @ts-ignore */}
  <InputBase label="密码:"></InputBase>
</Field>
```

> rule 属性支持以数组形式存在的校验规则集，每个规则由规则类型字段（required,min,max,minLength,maxLength,pattern）和错误信息字段组成
> required 字段的值是布尔类型
> min,max，minLength,maxLength 字段的值是数字
> pattern 字段的值是正则表达式或返回布尔值的函数

### 捕获错误

当定义好了每个表单域的校验规则以后，一般需要在输入时或者表单域失去焦点时校验数据，数据校验不通过时通常需要显示错误信息，以提醒用户修正输入内容。
AForm 通过外部业务组件中出入的 setState 函数，将校验结果返回给外部业务组件。示例代码如下：

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
      <Label className={styles.fieldLabel}>{props.label}</Label>
      <Input
        className={styles.fieldInputText}
        value={props.value}
        onInput={props.onInput}
      ></Input>
    </View>
  );
}

export default () => {
  const [errors, setErrors] = useState(); // NOTE-1 外部业务组件定义 state
  useEffect(() => {
    console.log("check", errors);
  }, [errors]);
  return (
    <View className={styles.formBox}>
      {/* NOTE-2 传入 setState 函数，捕获检验结果 */}
      <Form onSubmit={(data) => console.log(data)} registerError={setErrors}>
        <Field
          name="nickname"
          rule={[{ required: true, message: "请输入呢称" }]}
          component={InputBase}
          xProps={{ label: "昵称" }}
        >
          {/* @ts-ignore */}
        </Field>
        <Field
          name="password"
          rule={[{ required: true, message: "请输入密码" }]}
        >
          {/* @ts-ignore */}
          <InputBase label="密码:"></InputBase>
        </Field>
        <Field
          name="rePassword"
          rule={[{ required: true, message: "请输入密码" }]}
        >
          {/* @ts-ignore */}
          <InputBase label="重复密码:"></InputBase>
        </Field>
        <Submit className={styles.btnSubmit}>注册</Submit>
      </Form>
    </View>
  );
};
```

> 捕获错误信息的代码在 NOTE-1， 和 NOTE-2 注释

### 提交请求

表单输入的数据获取时通过 Form 里的 onSubmit 。

<!--  -->

```js
import { useForm, Form, Field} from '@redchili/react-form'
function Demo() {
  const {form, effects} = useForm({
    verifyFocus: true, // submit 触发的校验之后是否聚焦到第一个错误的表单域
    verifyMode:'onBlur'|'manual', // 校验模式：onBlur 失去焦点 ，manual 手动校验，在调用 form.submit 时校验
  });

  effects(({on,set})=>{
    on('sex',({value,error})=>{
      if(value === Sex.MALE){
        set('food', {value: 'xxx'})
        set('food', {hide:true})
      } else {
        set('food',{hide:false})
      }
    })
  })

  useEffect(()=>{
    if (initialValues) {
      form.setInitialValues(initialValues, true) // 是否触发校验
    }
  },[initialValues])

  const handleSubmit = () =>{
    form.reset()

    form.submit().then(() =>{

    }).catch((errors)=>{

    })
  }

  return (
    <Form form={form}>
    <Field name='' rules={[]} defaultValue="">
      <label for='sex'>
      <Checkbox />
    </Field>
    <div>
      <Input />
    </div>
      <Button onClick={handleSubmit} >
    </Form>
  );
}
```

```js
<Form>
  <Field rules="">
    <label>nickname</label>
    <input name="nickname" />
  </Field>
</Form>
```
