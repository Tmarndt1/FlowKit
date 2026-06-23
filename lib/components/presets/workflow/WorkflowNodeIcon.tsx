import * as React from "react";

type IconProps = { color?: string };

const S = (props: React.SVGProps<SVGSVGElement>) => (
    <svg fill="none" height={14} viewBox="0 0 16 16" width={14} xmlns="http://www.w3.org/2000/svg" {...props} />
);

// ── Input ────────────────────────────────────────────────────────────────────

const NumberInputIcon = () => (
    <S>
        <text dominantBaseline="middle" fill="currentColor" fontFamily="monospace" fontSize="12" fontWeight="800" textAnchor="middle" x="8" y="9">#</text>
    </S>
);

const BooleanInputIcon = () => (
    <S>
        <text dominantBaseline="middle" fill="currentColor" fontFamily="sans-serif" fontSize="11" fontWeight="800" textAnchor="middle" x="8" y="9">B</text>
    </S>
);

const TextInputIcon = () => (
    <S>
        <text dominantBaseline="middle" fill="currentColor" fontFamily="serif" fontSize="12" fontWeight="700" textAnchor="middle" x="8" y="9">T</text>
        <line stroke="currentColor" strokeWidth="1.5" x1="3" x2="13" y1="13" y2="13" />
    </S>
);

const ConstantInputIcon = () => (
    <S>
        <text dominantBaseline="middle" fill="currentColor" fontFamily="sans-serif" fontSize="11" fontWeight="800" textAnchor="middle" x="8" y="9">C</text>
    </S>
);

const VariableInputIcon = () => (
    <S>
        <text dominantBaseline="middle" fill="currentColor" fontFamily="serif" fontSize="11" fontStyle="italic" fontWeight="700" textAnchor="middle" x="7" y="8">x</text>
        <circle cx="13" cy="12" fill="currentColor" r="1.5" />
    </S>
);

// ── Math ─────────────────────────────────────────────────────────────────────

const AddIcon = () => (
    <S>
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" x1="8" x2="8" y1="3" y2="13" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" x1="3" x2="13" y1="8" y2="8" />
    </S>
);

const SubtractIcon = () => (
    <S>
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" x1="3" x2="13" y1="8" y2="8" />
    </S>
);

const MultiplyIcon = () => (
    <S>
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" x1="4" x2="12" y1="4" y2="12" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" x1="12" x2="4" y1="4" y2="12" />
    </S>
);

const DivideIcon = () => (
    <S>
        <circle cx="8" cy="4" fill="currentColor" r="1.5" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" x1="3" x2="13" y1="8" y2="8" />
        <circle cx="8" cy="12" fill="currentColor" r="1.5" />
    </S>
);

const RoundIcon = () => (
    <S>
        <path d="M4 12 Q4 4 8 4 Q12 4 12 8" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="2" x1="5" x2="11" y1="12" y2="12" />
    </S>
);

// ── Logic ─────────────────────────────────────────────────────────────────────

const GreaterThanIcon = () => (
    <S>
        <polyline fill="none" points="4,3 12,8 4,13" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </S>
);

const LessThanIcon = () => (
    <S>
        <polyline fill="none" points="12,3 4,8 12,13" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </S>
);

const EqualIcon = () => (
    <S>
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="2" x1="3" x2="13" y1="6" y2="6" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="2" x1="3" x2="13" y1="10" y2="10" />
    </S>
);

const AndIcon = () => (
    <S>
        <path d="M4 3 H9 Q14 3 14 8 Q14 13 9 13 H4 Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
        <line stroke="currentColor" strokeWidth="1.8" x1="1" x2="4" y1="6" y2="6" />
        <line stroke="currentColor" strokeWidth="1.8" x1="1" x2="4" y1="10" y2="10" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" x1="14" x2="16" y1="8" y2="8" />
    </S>
);

const OrIcon = () => (
    <S>
        <path d="M3 3 Q7 3 10 8 Q7 13 3 13 Q6 8 3 3Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
        <path d="M3 3 Q10 3 13 8 Q10 13 3 13" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
        <line stroke="currentColor" strokeWidth="1.8" x1="0" x2="3" y1="6" y2="6" />
        <line stroke="currentColor" strokeWidth="1.8" x1="0" x2="3" y1="10" y2="10" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" x1="13" x2="16" y1="8" y2="8" />
    </S>
);

const NotIcon = () => (
    <S>
        <path d="M3 4 L3 12 L12 8 Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
        <circle cx="13.5" cy="8" fill="none" r="1.5" stroke="currentColor" strokeWidth="1.8" />
    </S>
);

const SwitchIcon = () => (
    <S>
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" x1="2" x2="7" y1="8" y2="8" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" x1="7" x2="14" y1="8" y2="4" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" x1="7" x2="14" y1="8" y2="8" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" x1="7" x2="14" y1="8" y2="12" />
        <circle cx="7" cy="8" fill="currentColor" r="1.5" />
    </S>
);

const IfElseIcon = () => (
    <S>
        <diamond />
        <path d="M8 2 L14 8 L8 14 L2 8 Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" x1="8" x2="8" y1="0" y2="2" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" x1="14" x2="16" y1="8" y2="5" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" x1="14" x2="16" y1="8" y2="11" />
    </S>
);

// ── Policy ────────────────────────────────────────────────────────────────────

const DecisionTableIcon = () => (
    <S>
        <rect fill="none" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.8" width="12" x="2" y="2" />
        <line stroke="currentColor" strokeWidth="1.5" x1="2" x2="14" y1="6" y2="6" />
        <line stroke="currentColor" strokeWidth="1.5" x1="2" x2="14" y1="10" y2="10" />
        <line stroke="currentColor" strokeWidth="1.5" x1="6" x2="6" y1="6" y2="14" />
    </S>
);

// ── Utility ───────────────────────────────────────────────────────────────────

const FormatIcon = () => (
    <S>
        <text dominantBaseline="middle" fill="currentColor" fontFamily="sans-serif" fontSize="9" fontWeight="700" textAnchor="middle" x="8" y="7">Aa</text>
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" x1="3" x2="13" y1="12" y2="12" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" x1="3" x2="7" y1="12" y2="12" />
    </S>
);

const ConvertIcon = () => (
    <S>
        <path d="M4 6 Q4 3 8 3 Q12 3 12 6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        <polyline fill="none" points="10,4 12,6 14,4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        <path d="M12 10 Q12 13 8 13 Q4 13 4 10" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        <polyline fill="none" points="6,12 4,10 2,12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </S>
);

const CoalesceIcon = () => (
    <S>
        <text dominantBaseline="middle" fill="currentColor" fontFamily="monospace" fontSize="10" fontWeight="900" textAnchor="middle" x="8" y="9">??</text>
    </S>
);

const DelayIcon = () => (
    <S>
        <circle cx="8" cy="8.5" fill="none" r="5.5" stroke="currentColor" strokeWidth="1.8" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" x1="8" x2="8" y1="3" y2="8.5" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" x1="8" x2="11" y1="8.5" y2="8.5" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="2" x1="6" x2="10" y1="1.5" y2="1.5" />
    </S>
);

const DerivativeIcon = () => (
    <S>
        <text dominantBaseline="middle" fill="currentColor" fontFamily="serif" fontSize="7" fontStyle="italic" fontWeight="700" textAnchor="middle" x="8" y="5.5">dy</text>
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" x1="3.5" x2="12.5" y1="8.5" y2="8.5" />
        <text dominantBaseline="middle" fill="currentColor" fontFamily="serif" fontSize="7" fontStyle="italic" fontWeight="700" textAnchor="middle" x="8" y="12">dx</text>
    </S>
);

const DeltaIcon = () => (
    <S>
        <polyline fill="none" points="8,2 14,13 2,13" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" x1="5.5" x2="10.5" y1="10" y2="10" />
    </S>
);

const RunningAverageIcon = () => (
    <S>
        <polyline fill="none" points="2,11 5,7 8,9 11,4 14,6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        <line stroke="currentColor" strokeDasharray="2 1.5" strokeLinecap="round" strokeWidth="1.4" x1="2" x2="14" y1="8" y2="8" />
    </S>
);

const ArrayAverageIcon = () => (
    <S>
        <text dominantBaseline="middle" fill="currentColor" fontFamily="serif" fontSize="11" fontStyle="italic" fontWeight="700" textAnchor="middle" x="7" y="8">x</text>
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" x1="5" x2="9" y1="5" y2="5" />
        <circle cx="12" cy="8" fill="currentColor" r="1.2" />
    </S>
);

// ── Output ────────────────────────────────────────────────────────────────────

const ResultOutputIcon = () => (
    <S>
        <polyline fill="none" points="3,8 6.5,12 13,4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
    </S>
);

const LogOutputIcon = () => (
    <S>
        <rect fill="none" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.8" width="10" x="3" y="2" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" x1="5.5" x2="10.5" y1="6" y2="6" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" x1="5.5" x2="10.5" y1="8.5" y2="8.5" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" x1="5.5" x2="8.5" y1="11" y2="11" />
    </S>
);

const AlertOutputIcon = () => (
    <S>
        <path d="M8 2 L14 13 H2 Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="2" x1="8" x2="8" y1="6.5" y2="9.5" />
        <circle cx="8" cy="11.5" fill="currentColor" r="0.9" />
    </S>
);

// ── Data ──────────────────────────────────────────────────────────────────────

const ArrayInputIcon = () => (
    <S>
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="2" x1="3" x2="3" y1="4" y2="12" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="2" x1="13" x2="13" y1="4" y2="12" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" x1="3" x2="6" y1="8" y2="8" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" x1="10" x2="13" y1="8" y2="8" />
        <circle cx="8" cy="8" fill="currentColor" r="1.2" />
    </S>
);

const ObjectInputIcon = () => (
    <S>
        <path d="M6 3 Q3 3 3 6 V10 Q3 13 6 13" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        <path d="M10 3 Q13 3 13 6 V10 Q13 13 10 13" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        <circle cx="6.5" cy="8" fill="currentColor" r="1.1" />
        <circle cx="9.5" cy="8" fill="currentColor" r="1.1" />
    </S>
);

const ArrayMapIcon = () => (
    <S>
        <rect fill="none" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" width="5" x="1" y="5.5" />
        <rect fill="none" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" width="5" x="10" y="5.5" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" x1="6" x2="10" y1="8" y2="8" />
        <polyline fill="none" points="8.5,6 10,8 8.5,10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </S>
);

const ArrayFilterIcon = () => (
    <S>
        <path d="M2 4 H14 L9.5 9 V13 L6.5 11.5 V9 Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
    </S>
);

const ArrayReduceIcon = () => (
    <S>
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" x1="2" x2="7" y1="5" y2="8" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" x1="2" x2="7" y1="11" y2="8" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" x1="7" x2="14" y1="8" y2="8" />
        <circle cx="14" cy="8" fill="currentColor" r="1.5" />
    </S>
);

const ObjectGetIcon = () => (
    <S>
        <path d="M4 3 Q2 3 2 5 V11 Q2 13 4 13 H8" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        <circle cx="5.5" cy="8" fill="currentColor" r="1.2" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" x1="9" x2="14" y1="8" y2="8" />
        <polyline fill="none" points="12,6 14,8 12,10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </S>
);

const ObjectSetIcon = () => (
    <S>
        <path d="M5 3 Q2 3 2 6 V10 Q2 13 5 13 H8" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        <circle cx="5.5" cy="8" fill="currentColor" r="1.2" />
        <path d="M10 10 L9 13 L12 12 L15 6 Q14 4 12 5 Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
        <line stroke="currentColor" strokeWidth="1.2" x1="12" x2="13.5" y1="5" y2="6.5" />
    </S>
);

// ── Text ──────────────────────────────────────────────────────────────────────

const ConcatIcon = () => (
    <S>
        <text dominantBaseline="middle" fill="currentColor" fontFamily="monospace" fontSize="8" fontWeight="700" x="1" y="8">"A"</text>
        <text dominantBaseline="middle" fill="currentColor" fontFamily="monospace" fontSize="8" fontWeight="700" x="8.5" y="8">+"B"</text>
    </S>
);

const SplitIcon = () => (
    <S>
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" x1="2" x2="7" y1="8" y2="8" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" x1="7" x2="12" y1="8" y2="4" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" x1="7" x2="12" y1="8" y2="12" />
        <line stroke="currentColor" strokeDasharray="2 1.5" strokeLinecap="round" strokeWidth="1.5" x1="7" x2="7" y1="2" y2="14" />
    </S>
);

const ContainsIcon = () => (
    <S>
        <circle cx="7" cy="7.5" fill="none" r="4.5" stroke="currentColor" strokeWidth="1.8" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="2" x1="10.2" x2="14" y1="10.7" y2="14" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" x1="5" y1="7.5" x2="9" y2="7.5" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" x1="7" y1="5.5" x2="7" y2="9.5" />
    </S>
);

const RegexMatchIcon = () => (
    <S>
        <text dominantBaseline="middle" fill="currentColor" fontFamily="monospace" fontSize="9" fontWeight="700" textAnchor="middle" x="8" y="7.5">.*</text>
        <line stroke="currentColor" strokeDasharray="2 1.5" strokeLinecap="round" strokeWidth="1.5" x1="2" x2="14" y1="12" y2="12" />
    </S>
);

const TemplateIcon = () => (
    <S>
        <text dominantBaseline="middle" fill="currentColor" fontFamily="monospace" fontSize="9" fontWeight="700" textAnchor="middle" x="8" y="9">{`{{}}`}</text>
    </S>
);

// ── Trigger ───────────────────────────────────────────────────────────────────

const WebhookIcon = () => (
    <S>
        <polyline fill="none" points="8,2 8,9" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
        <polyline fill="none" points="5,6 8,9 11,6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        <path d="M4 11 Q2 11 2 13 H14 Q14 11 12 11" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </S>
);

const ScheduleIcon = () => (
    <S>
        <circle cx="8" cy="9" fill="none" r="5.5" stroke="currentColor" strokeWidth="1.8" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" x1="8" x2="8" y1="4" y2="9" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" x1="8" x2="11" y1="9" y2="9" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" x1="5.5" x2="10.5" y1="2" y2="2" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" x1="6.5" x2="6.5" y1="1" y2="3" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" x1="9.5" x2="9.5" y1="1" y2="3" />
    </S>
);

const HttpRequestIcon = () => (
    <S>
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" x1="2" x2="14" y1="6" y2="6" />
        <polyline fill="none" points="11,4 14,6 11,8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" x1="14" x2="2" y1="10" y2="10" />
        <polyline fill="none" points="5,8 2,10 5,12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </S>
);

// ── Flow ──────────────────────────────────────────────────────────────────────

const MergeIcon = () => (
    <S>
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" x1="2" x2="7" y1="4" y2="8" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" x1="2" x2="7" y1="12" y2="8" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" x1="7" x2="14" y1="8" y2="8" />
        <circle cx="7" cy="8" fill="currentColor" r="1.5" />
    </S>
);

const BatchIcon = () => (
    <S>
        <rect fill="none" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" width="8" x="4" y="9" />
        <rect fill="none" height="5" rx="1" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1.5" width="8" x="3" y="7" />
        <rect fill="none" height="5" rx="1" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5" width="8" x="2" y="5" />
    </S>
);

const FanOutIcon = () => (
    <S>
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" x1="2" x2="8" y1="8" y2="8" />
        <circle cx="8" cy="8" fill="currentColor" r="1.5" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" x1="8" x2="14" y1="8" y2="4" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" x1="8" x2="14" y1="8" y2="8" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" x1="8" x2="14" y1="8" y2="12" />
    </S>
);

// ── Annotation ────────────────────────────────────────────────────────────────

const AnnotationIcon = () => (
    <S>
        <path d="M3 2 H11 L14 5 V14 H3 Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
        <path d="M11 2 V5 H14" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" x1="5.5" x2="10.5" y1="8" y2="8" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" x1="5.5" x2="10.5" y1="10.5" y2="10.5" />
    </S>
);

// ── Registry ──────────────────────────────────────────────────────────────────

const iconMap: Record<string, React.FC> = {
    "number-input": NumberInputIcon,
    "boolean-input": BooleanInputIcon,
    "text-input": TextInputIcon,
    "constant-input": ConstantInputIcon,
    "variable-input": VariableInputIcon,
    "math-add": AddIcon,
    "math-subtract": SubtractIcon,
    "math-multiply": MultiplyIcon,
    "math-divide": DivideIcon,
    "math-round": RoundIcon,
    "logic-greater-than": GreaterThanIcon,
    "logic-less-than": LessThanIcon,
    "logic-equal": EqualIcon,
    "logic-and": AndIcon,
    "logic-or": OrIcon,
    "logic-not": NotIcon,
    "logic-switch": SwitchIcon,
    "logic-if-else": IfElseIcon,
    "policy-decision-table": DecisionTableIcon,
    "policy-threshold": DecisionTableIcon,
    "utility-format": FormatIcon,
    "utility-convert": ConvertIcon,
    "utility-coalesce": CoalesceIcon,
    "utility-delay": DelayIcon,
    "utility-derivative": DerivativeIcon,
    "utility-delta": DeltaIcon,
    "utility-running-average": RunningAverageIcon,
    "array-average": ArrayAverageIcon,
    "result-output": ResultOutputIcon,
    "log-output": LogOutputIcon,
    "alert-output": AlertOutputIcon,
    "array-input": ArrayInputIcon,
    "object-input": ObjectInputIcon,
    "array-map": ArrayMapIcon,
    "array-filter": ArrayFilterIcon,
    "array-reduce": ArrayReduceIcon,
    "object-get": ObjectGetIcon,
    "object-set": ObjectSetIcon,
    "text-concat": ConcatIcon,
    "text-split": SplitIcon,
    "text-contains": ContainsIcon,
    "text-regex-match": RegexMatchIcon,
    "text-template": TemplateIcon,
    "webhook-trigger": WebhookIcon,
    "schedule-trigger": ScheduleIcon,
    "http-request": HttpRequestIcon,
    "flow-merge": MergeIcon,
    "flow-batch": BatchIcon,
    "flow-fan-out": FanOutIcon,
    "annotation": AnnotationIcon,
};

export function WorkflowNodeIcon({ nodeType, fallback }: { nodeType: string; fallback: string }): React.ReactElement {
    const Icon = iconMap[nodeType];

    if (Icon != null) return <Icon />;

    return <>{fallback}</>;
}
