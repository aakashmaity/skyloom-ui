// @vitest-environment node
import { describe, expect, it } from "vitest";
import ts from "typescript";
import path from "node:path";
import { playgrounds } from "../apps/docs/src/features/design-system/playgrounds";

describe("copyable playground examples", () => {
  it("typechecks every selectable option against the package API", () => {
    const files = new Map<string, string>();
    for (const [name, definition] of Object.entries(playgrounds)) {
      for (const control of definition.controls) for (const value of control.options) {
        const filename = path.resolve(`.checks/code-${name}-${control.key}-${value}.tsx`).replaceAll("\\", "/");
        files.set(filename, definition.source({ ...definition.defaults, [control.key]: value }));
      }
    }
    const options: ts.CompilerOptions = { strict: true, skipLibCheck: true, noEmit: true, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler };
    const host = ts.createCompilerHost(options);
    const originalRead = host.readFile, originalExists = host.fileExists;
    host.readFile = filename => files.get(filename.replaceAll("\\", "/")) ?? originalRead(filename);
    host.fileExists = filename => files.has(filename.replaceAll("\\", "/")) || originalExists(filename);
    const program = ts.createProgram([...files.keys()], options, host);
    const errors = ts.getPreEmitDiagnostics(program);
    expect(ts.formatDiagnosticsWithColorAndContext(errors, { getCanonicalFileName: name => name, getCurrentDirectory: () => process.cwd(), getNewLine: () => "\n" })).toBe("");
  }, 90000);
});
