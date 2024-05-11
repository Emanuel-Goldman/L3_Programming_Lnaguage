
import { isProgram, isDefineExp, isNumExp,PrimOp, isBoolExp, isPrimOp, isVarRef, isAppExp, isIfExp, isProcExp, Exp, Program, AppExp, VarDecl} from './L31-ast';
import { Result, makeOk, makeFailure, bind, mapResult } from "../shared/result";

 export const l2ToPython = (exp: Exp | Program): Result<string>  => 
    isProgram(exp) ? bind(mapResult(l2ToPython, exp.exps), (exps: string[]) => makeOk(`${exps.join("\n")}`)) :
    isDefineExp(exp) ? bind(l2ToPython(exp.val), (val: string) => makeOk(`${exp.var.var} = ${val}`)) :
    isNumExp(exp) ? makeOk(exp.val.toString()) :
    isBoolExp(exp) ? makeOk(exp.val ? "True" : "False") :
    isPrimOp(exp) ? makeOk(PrimOpTopython(exp)) :
    isVarRef(exp) ? makeOk(exp.var) :
    isProcExp(exp) ? bind(mapResult(l2ToPython, exp.body), (body: string[]) => makeOk(`(lambda ${map((p: VarDecl) => p.var, exp.args).join(",")} : ${body.join("\n")})`)) :
    isIfExp(exp) ? safe3((test: string, then: string, alt: string) => makeOk(`(${then} if ${test} else ${alt})`))
                    (l2ToPython(exp.test), l2ToPython(exp.then), l2ToPython(exp.alt)) :
    isAppExp(exp) ? l2ToPythonAppExp(exp) :
    makeFailure(`Unknown expression: ${exp}`);


    export const PrimOpTopython = (op: PrimOp): string =>

        op.op === "=" ? "==" :
        op.op === "and" ? "and" :
        op.op === "or" ? "or" :
        op.op === "not" ? "not" :
        op.op === "number?" ? "isinstance({}, int, float)" :
        op.op === "boolean?" ? "isinstance({}, bool)" :
        op.op === "eq?" ? "==" :
        op.op;

    export const safe3 = <T1, T2, T3, T4>(proc: (arg1: T1, arg2: T2, arg3: T3) => Result<T4>) =>
    (arg1: Result<T1>, arg2: Result<T2>, arg3: Result<T3>): Result<T4> =>
    bind(arg1, (a1: T1) => bind(arg2, (a2: T2) => bind(arg3, (a3: T3) => proc(a1, a2, a3))));

    export const l2ToPythonAppExp = (app: AppExp): Result<string> => 
        isPrimOp(app.rator) ? ( app.rator.op === "not" ? bind(l2ToPython(app.rator), (rator: string) => bind(l2ToPython(app.rands[0]), (rand: string) => makeOk(`(not ${rand})`))) :
                        ["boolean?", "number?"].includes(app.rator.op) ? bind(l2ToPython(app.rator), (rator: string) => bind(l2ToPython(app.rands[0]), (rands: string) => (makeOk(`${rator} (${rands})`)))) :
                        ["<",">","=","eq?","and","or"].includes(app.rator.op) ? bind(l2ToPython(app.rator), (rator: string) =>
                                                                                     bind(l2ToPython(app.rands[0]), (rand1: string) => 
                                                                                        bind(l2ToPython(app.rands[1]), (rand2: string) => makeOk(`(${rand1} ${rator} ${rand2})`)))) :
                                                                                            bind(l2ToPython(app.rator), (rator : string) => 
                                                                                                bind(mapResult(l2ToPython,app.rands), (rands: string[]) =>makeOk(`(${rands.join(` ${rator} `)})`))) ):
        bind(l2ToPython(app.rator), (rator: string) => bind(mapResult(l2ToPython, app.rands), (rands: string[]) => makeOk(`${rator}(${rands.join(",")})`)));

    export const map = <T, R>(f: (x: T) => R, lst: T[]): R[] =>
    lst.map(f);


    