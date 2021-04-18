import React, { useContext } from "react";
// --inject--
// import { Button } from '@tarojs/components'
// import { Button } from '@remax/wechat'
// --end--
import { FormContext } from "../context";

interface Props {
  className?: string
  style?: Record<string, string>
}

export default function Submit(props: React.PropsWithChildren<Props>) {
  const { children, ...rest } = props;
  const { onSubmit } = useContext(FormContext);

  const bind = (child: React.ReactNode) => {
    if (!React.isValidElement(child)) {
      return null;
    }
    // DONE: 判断 ReactNode 是否是 function(input 是这个类型， label 不是这个类型，还需要看其他自定义组件时类型是什么)
    // if (typeof child.type === "function") {
    const childProps = {
      ...child.props,
      ...{
        onClick: onSubmit,
      },
    };
    return React.cloneElement(child, childProps);
  };

  // DONE: remax/one 文档有误，此版本不存在 htmlFor , 故自己绑定 onSubmit 方法来触发 form 父组件的 submit
  return <button {...rest}>{React.Children.map(children, bind)}</button>;
}
