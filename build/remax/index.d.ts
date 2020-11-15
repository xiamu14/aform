import React from "react";
declare type Data = Record<string, string | number>;
interface Props {
    onSubmit: (data?: Data) => void;
    registerError?: React.Dispatch<React.SetStateAction<{}>>;
    initialValues?: Data;
    checkMode?: "blur" | "input";
}
declare const _default: React.ForwardRefExoticComponent<Props & {
    children?: React.ReactNode;
} & React.RefAttributes<{}>>;
export default _default;
