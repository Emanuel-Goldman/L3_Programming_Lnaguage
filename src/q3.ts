
import {  Exp, Program, isLetExp, isLitExp, isProcExp, isDefineExp, isProgram, isIfExp, makeIfExp} from "./L31-ast";
import { isAppExp, CExp,ElseClauseExp, Clause,makeAppExp, makeProcExp,Binding,makeBinding,isBinding,makeLetExp, isCondExp, CondExp, IfExp, isExp, makeProgram, isCExp, makeDefineExp} from "./L31-ast";
import { Result, makeFailure, makeOk ,mapv,mapResult,bind} from "../shared/result";
import { isAtomicExp } from "./L31-ast";
import { CondClauseExp} from "./L31-ast";


/*
Purpose: Transform L31 AST to L3 AST
Signature: l31ToL3(l31AST)
Type: [Exp | Program] => Result<Exp | Program>
*/
export const L31ToL3 = (exp: Exp | Program): Result<Exp | Program> =>
    isProgram(exp) ? mapv(mapResult(L31ToL3Exp,exp.exps), makeProgram) :
    isExp(exp) ? L31ToL3Exp(exp) :
    makeFailure("not a program or an expretion");


export const L31ToL3Exp = (exp: Exp): Result<Exp> =>
    isDefineExp(exp) ? bind(L31ToL3CExp(exp.val), (val: CExp) => makeOk(makeDefineExp(exp.var, val))) :
    isCExp(exp) ? L31ToL3CExp(exp) :    
    makeFailure("not a CExp or a Difine Expretion");


export const L31ToL3CExp = (exp: CExp): Result<CExp> =>
    isAtomicExp(exp) ? makeOk(exp) :
    isLitExp(exp) ? makeOk(exp) :
    isCondExp(exp) ?bind(condToifL3(exp),L31ToL3CExp):
    isIfExp(exp) ? bind(L31ToL3CExp(exp.test), (test: CExp) =>
                    bind(L31ToL3CExp(exp.then), (then: CExp) =>
                    bind(L31ToL3CExp(exp.alt), (alt: CExp) =>
                    makeOk(makeIfExp(test, then, alt))))) :
    isProcExp(exp) ? bind(mapResult(L31ToL3CExp, exp.body), (body: CExp[]) =>
                    makeOk(makeProcExp(exp.args, body))) :
    isAppExp(exp) ? bind(L31ToL3CExp(exp.rator), (rator: CExp) =>
                    bind(mapResult(L31ToL3CExp, exp.rands), (rands: CExp[]) =>
                    makeOk(makeAppExp(rator, rands)))) :
    isLetExp(exp) ? bind(mapResult(L31ToL3Binding, exp.bindings), (bindings: Binding[]) =>
                    bind(mapResult(L31ToL3CExp, exp.body), (body: CExp[]) =>
                    makeOk(makeLetExp(bindings, body)))) :

    makeFailure("not a Cexp");

export const L31ToL3Binding = (b: Binding): Result<Binding> =>
    isBinding(b) ? bind(L31ToL3CExp(b.val), (val: CExp) =>
                    makeOk(makeBinding(b.var.var, val))) :
    makeFailure("not a good BindingExp");
    

export const condToifL3 = (cond : CondExp) : Result<IfExp> => 
    clausesToIf(cond.CondClauses,cond.Else)
    
export const clausesToIf = (clauses : Clause[],els : ElseClauseExp) : Result<IfExp> | any =>
    clauses.length === 0 ? makeOk(els.res) :
    bind(clausesToIf(clauses.slice(1),els), 
    (ifexp : IfExp) => makeOk(makeIfExp((clauses[0] as CondClauseExp).test , (clauses[0] as CondClauseExp).then , ifexp))) ;



