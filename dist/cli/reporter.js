export function formatHuman(diagnostics) {
    if (diagnostics.length === 0)
        return "No issues found.";
    return diagnostics
        .map((d) => `${d.code} ${d.severity} ${d.target}\n  Claim: ${d.claim}\n  Source: ${d.source.file}:${d.source.line}\n  Action: ${d.action}`)
        .join("\n\n");
}
export function formatJson(diagnostics) {
    return JSON.stringify(diagnostics, null, 2);
}
