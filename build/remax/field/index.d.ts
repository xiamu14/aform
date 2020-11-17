import React, { FunctionComponent } from "react";
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
export declare type Rule = RequireRule | PatternRule | RangeMinRule | RangeMaxRule | RangeMinLengthRule | RangeMaxLengthRule;
interface Props {
    name: string;
    className?: string;
    style?: Record<string, string>;
    checkMode?: "blur" | "input";
    rule?: Rule[];
    component?: FunctionComponent<{
        value: any;
        onInput: (itemValue: any) => void;
    }>;
    xProps?: any;
}
export default function Field(props: React.PropsWithChildren<Props>): JSX.Element;
export {};
