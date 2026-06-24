import { useState } from "react";

interface CodeBlockProps {
    code: string;
}

export function CodeBlock({ code }: CodeBlockProps) {
    const [copied, setCopied] = useState(false);

    const copy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={{ position: "relative" }}>
            <button
                onClick={copy}
                style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 5,
                    color: copied ? "#3ecf8e" : "#7a839a",
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "3px 10px",
                    cursor: "pointer",
                    zIndex: 2,
                    transition: "color 0.15s",
                }}
            >
                {copied ? "Copied!" : "Copy"}
            </button>
            <pre>
                <code dangerouslySetInnerHTML={{ __html: highlight(code) }} />
            </pre>
        </div>
    );
}

const KEYWORDS = new Set([
    "import", "export", "from", "const", "let", "var", "function", "return",
    "type", "interface", "extends", "implements", "new", "class", "default",
    "as", "if", "else", "for", "while", "switch", "case", "break", "continue",
    "null", "undefined", "true", "false", "void", "async", "await", "of", "in",
    "typeof", "keyof", "readonly", "static", "public", "private", "protected",
    "enum", "namespace", "declare", "abstract", "override",
]);

type TokenType = "kw" | "str" | "cmt" | "fn" | "num" | "tag" | "plain";
interface Token { type: TokenType; value: string }

function tokenize(src: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;

    while (i < src.length) {
        // Line comment
        if (src[i] === "/" && src[i + 1] === "/") {
            const end = src.indexOf("\n", i);
            const to = end === -1 ? src.length : end;
            tokens.push({ type: "cmt", value: src.slice(i, to) });
            i = to;
            continue;
        }
        // Block comment
        if (src[i] === "/" && src[i + 1] === "*") {
            const end = src.indexOf("*/", i + 2);
            const to = end === -1 ? src.length : end + 2;
            tokens.push({ type: "cmt", value: src.slice(i, to) });
            i = to;
            continue;
        }
        // JSX/TSX tag opener: < followed by letter or /letter
        if (src[i] === "<" && (src[i + 1] === "/" ? /[A-Za-z]/.test(src[i + 2] ?? "") : /[A-Za-z]/.test(src[i + 1] ?? ""))) {
            let j = i + 1;
            if (src[j] === "/") j++;
            while (j < src.length && /[A-Za-z0-9.:]/.test(src[j])) j++;
            tokens.push({ type: "tag", value: src.slice(i, j) });
            i = j;
            continue;
        }
        // Template literal
        if (src[i] === "`") {
            let j = i + 1;
            while (j < src.length && src[j] !== "`") {
                if (src[j] === "\\") j++;
                j++;
            }
            tokens.push({ type: "str", value: src.slice(i, j + 1) });
            i = j + 1;
            continue;
        }
        // Single/double quoted string
        if (src[i] === '"' || src[i] === "'") {
            const q = src[i];
            let j = i + 1;
            while (j < src.length && src[j] !== q && src[j] !== "\n") {
                if (src[j] === "\\") j++;
                j++;
            }
            tokens.push({ type: "str", value: src.slice(i, j + 1) });
            i = j + 1;
            continue;
        }
        // Number
        if (/\d/.test(src[i]) && (i === 0 || !/[A-Za-z_$]/.test(src[i - 1]))) {
            let j = i;
            while (j < src.length && /[\d._]/.test(src[j])) j++;
            tokens.push({ type: "num", value: src.slice(i, j) });
            i = j;
            continue;
        }
        // Identifier / keyword
        if (/[A-Za-z_$]/.test(src[i])) {
            let j = i;
            while (j < src.length && /[A-Za-z0-9_$]/.test(src[j])) j++;
            const word = src.slice(i, j);
            let type: TokenType = "plain";
            if (KEYWORDS.has(word)) {
                type = "kw";
            } else if (/^use[A-Z]/.test(word) || /^[A-Z]/.test(word)) {
                // Only highlight as component/hook if followed by ( < { [ or space+( etc.
                // lookahead in the raw source
                const after = src.slice(j).trimStart();
                if (/^[(<{[\s,;|&:=)]/.test(after) || j === src.length) {
                    type = "fn";
                }
            }
            tokens.push({ type, value: word });
            i = j;
            continue;
        }
        // Anything else (operators, punctuation, whitespace)
        tokens.push({ type: "plain", value: src[i] });
        i++;
    }

    return tokens;
}

function esc(s: string): string {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function highlight(code: string): string {
    return tokenize(code)
        .map(({ type, value }) => {
            const v = esc(value);
            return type === "plain" ? v : `<span class="${type}">${v}</span>`;
        })
        .join("");
}

interface DemoSplitProps {
    demo: React.ReactNode;
    code: string;
    demoHeight?: number;
}

export function DemoSplit({ demo, code, demoHeight = 320 }: DemoSplitProps) {
    return (
        <div className="demo-split">
            <div className="demo-pane" style={{ minHeight: demoHeight }}>
                <span className="demo-pane-label">Preview</span>
                {demo}
            </div>
            <div className="code-pane">
                <CodeBlock code={code} />
            </div>
        </div>
    );
}
