import * as React from "react";

const S = (props: React.SVGProps<SVGSVGElement>) => (
    <svg fill="none" height={40} viewBox="0 0 40 40" width={40} xmlns="http://www.w3.org/2000/svg" {...props} />
);

// ── Infrastructure ────────────────────────────────────────────────────────────

const RouterIcon = () => (
    <S>
        <rect fill="currentColor" fillOpacity=".12" height="12" rx="3" width="30" x="5" y="14" />
        <rect height="12" rx="3" stroke="currentColor" strokeWidth="1.6" width="30" x="5" y="14" />
        <circle cx="12" cy="20" fill="currentColor" r="2" />
        <circle cx="20" cy="20" fill="currentColor" r="2" />
        <circle cx="28" cy="20" fill="currentColor" r="2" />
        <path d="M20 14 V8 M16 8 H24" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
        <circle cx="16" cy="8" fill="currentColor" r="1.5" />
        <circle cx="24" cy="8" fill="currentColor" r="1.5" />
    </S>
);

const SwitchIcon = () => (
    <S>
        <rect fill="currentColor" fillOpacity=".12" height="12" rx="3" width="30" x="5" y="14" />
        <rect height="12" rx="3" stroke="currentColor" strokeWidth="1.6" width="30" x="5" y="14" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" x1="11" x2="11" y1="14" y2="26" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" x1="17" x2="17" y1="14" y2="26" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" x1="23" x2="23" y1="14" y2="26" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" x1="29" x2="29" y1="14" y2="26" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" x1="11" x2="11" y1="26" y2="32" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" x1="17" x2="17" y1="26" y2="32" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" x1="23" x2="23" y1="26" y2="32" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" x1="29" x2="29" y1="26" y2="32" />
    </S>
);

const SwitchL3Icon = () => (
    <S>
        <rect fill="currentColor" fillOpacity=".12" height="12" rx="3" width="30" x="5" y="14" />
        <rect height="12" rx="3" stroke="currentColor" strokeWidth="1.6" width="30" x="5" y="14" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" x1="11" x2="11" y1="14" y2="26" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" x1="17" x2="17" y1="14" y2="26" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" x1="23" x2="23" y1="14" y2="26" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" x1="29" x2="29" y1="14" y2="26" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" x1="11" x2="11" y1="26" y2="32" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" x1="17" x2="17" y1="26" y2="32" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" x1="23" x2="23" y1="26" y2="32" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" x1="29" x2="29" y1="26" y2="32" />
        <text dominantBaseline="middle" fill="currentColor" fontSize="7" fontWeight="800" textAnchor="middle" x="20" y="10">L3</text>
    </S>
);

const HubIcon = () => (
    <S>
        <rect fill="currentColor" fillOpacity=".12" height="10" rx="2.5" width="28" x="6" y="15" />
        <rect height="10" rx="2.5" stroke="currentColor" strokeWidth="1.6" width="28" x="6" y="15" />
        <circle cx="12" cy="20" fill="currentColor" r="1.5" />
        <circle cx="17" cy="20" fill="currentColor" r="1.5" />
        <circle cx="22" cy="20" fill="currentColor" r="1.5" />
        <circle cx="27" cy="20" fill="currentColor" r="1.5" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" x1="12" x2="12" y1="25" y2="31" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" x1="17" x2="17" y1="25" y2="31" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" x1="22" x2="22" y1="25" y2="31" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" x1="27" x2="27" y1="25" y2="31" />
    </S>
);

const BridgeIcon = () => (
    <S>
        <rect fill="currentColor" fillOpacity=".12" height="10" rx="2.5" width="28" x="6" y="15" />
        <rect height="10" rx="2.5" stroke="currentColor" strokeWidth="1.6" width="28" x="6" y="15" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="2" x1="20" x2="20" y1="15" y2="25" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" x1="6" x2="6" y1="20" y2="30" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" x1="34" x2="34" y1="20" y2="30" />
    </S>
);

const RepeaterIcon = () => (
    <S>
        <rect fill="currentColor" fillOpacity=".12" height="10" rx="2.5" width="22" x="9" y="15" />
        <rect height="10" rx="2.5" stroke="currentColor" strokeWidth="1.6" width="22" x="9" y="15" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" x1="3" x2="9" y1="20" y2="20" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" x1="31" x2="37" y1="20" y2="20" />
        <polyline fill="none" points="14,20 17,15 20,25 23,15 26,20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
    </S>
);

// ── Security ──────────────────────────────────────────────────────────────────

const FirewallIcon = () => (
    <S>
        <path d="M20 5 L33 10 V22 Q33 32 20 36 Q7 32 7 22 V10 Z" fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.6" />
        <path d="M20 12 Q24 14 24 18 Q24 22 20 24 Q16 22 16 18 Q16 14 20 12Z" fill="currentColor" fillOpacity=".4" />
        <path d="M20 14 Q22 16 22 18 Q22 21 20 23 Q18 21 18 18 Q18 16 20 14Z" fill="currentColor" />
    </S>
);

const VpnGatewayIcon = () => (
    <S>
        <circle cx="20" cy="20" fill="currentColor" fillOpacity=".12" r="13" stroke="currentColor" strokeWidth="1.6" />
        <ellipse cx="20" cy="20" fill="none" rx="6" ry="13" stroke="currentColor" strokeWidth="1.4" />
        <line stroke="currentColor" strokeWidth="1.4" x1="7" x2="33" y1="20" y2="20" />
        <line stroke="currentColor" strokeWidth="1.2" x1="8.5" x2="31.5" y1="14" y2="14" />
        <line stroke="currentColor" strokeWidth="1.2" x1="8.5" x2="31.5" y1="26" y2="26" />
        <path d="M26 7 L34 7 L34 13 L26 13 Z" fill="rgba(0,0,0,.5)" stroke="currentColor" strokeWidth="1.4" />
        <path d="M28 10 L30 8 L32 10" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
        <circle cx="30" cy="11.5" fill="currentColor" r="1" />
    </S>
);

const ProxyIcon = () => (
    <S>
        <rect fill="currentColor" fillOpacity=".12" height="14" rx="3" width="14" x="4" y="13" />
        <rect height="14" rx="3" stroke="currentColor" strokeWidth="1.6" width="14" x="4" y="13" />
        <rect fill="currentColor" fillOpacity=".12" height="14" rx="3" width="14" x="22" y="13" />
        <rect height="14" rx="3" stroke="currentColor" strokeWidth="1.6" width="14" x="22" y="13" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" x1="18" x2="22" y1="20" y2="20" />
        <polyline fill="none" points="20,18 22,20 20,22" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <circle cx="11" cy="20" fill="currentColor" r="2" />
        <circle cx="29" cy="20" fill="currentColor" r="2" />
    </S>
);

const IdsIcon = () => (
    <S>
        <circle cx="20" cy="20" fill="currentColor" fillOpacity=".12" r="13" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="20" cy="20" fill="none" r="8" stroke="currentColor" strokeWidth="1.4" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" x1="20" x2="20" y1="15" y2="21" />
        <circle cx="20" cy="24" fill="currentColor" r="1.5" />
    </S>
);

const LoadBalancerIcon = () => (
    <S>
        <circle cx="20" cy="12" fill="currentColor" fillOpacity=".2" r="4" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="10" cy="30" fill="currentColor" fillOpacity=".12" r="4" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="20" cy="30" fill="currentColor" fillOpacity=".12" r="4" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="30" cy="30" fill="currentColor" fillOpacity=".12" r="4" stroke="currentColor" strokeWidth="1.5" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" x1="20" x2="10" y1="16" y2="26" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" x1="20" x2="20" y1="16" y2="26" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" x1="20" x2="30" y1="16" y2="26" />
    </S>
);

// ── Server ────────────────────────────────────────────────────────────────────

const ServerBaseIcon = ({ children }: { children?: React.ReactNode }) => (
    <S>
        <rect fill="currentColor" fillOpacity=".12" height="8" rx="2" width="26" x="7" y="11" />
        <rect height="8" rx="2" stroke="currentColor" strokeWidth="1.5" width="26" x="7" y="11" />
        <rect fill="currentColor" fillOpacity=".08" height="8" rx="2" width="26" x="7" y="21" />
        <rect height="8" rx="2" stroke="currentColor" strokeWidth="1.5" width="26" x="7" y="21" />
        <circle cx="29" cy="15" fill="currentColor" r="1.5" />
        <circle cx="29" cy="25" fill="currentColor" r="1.5" />
        {children}
    </S>
);

const ServerWebIcon = () => (
    <ServerBaseIcon>
        <text dominantBaseline="middle" fill="currentColor" fontSize="6" fontWeight="700" textAnchor="middle" x="18" y="15">HTTP</text>
        <text dominantBaseline="middle" fill="currentColor" fontSize="5" fontWeight="600" textAnchor="middle" x="18" y="25">www</text>
    </ServerBaseIcon>
);

const ServerDatabaseIcon = () => (
    <S>
        <ellipse cx="20" cy="12" fill="currentColor" fillOpacity=".2" rx="11" ry="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 12 V26 Q9 30 20 30 Q31 30 31 26 V12" fill="currentColor" fillOpacity=".08" stroke="currentColor" strokeWidth="1.5" />
        <line stroke="currentColor" strokeWidth="1.2" x1="9" x2="31" y1="18" y2="18" />
        <line stroke="currentColor" strokeWidth="1.2" x1="9" x2="31" y1="24" y2="24" />
    </S>
);

const ServerAppIcon = () => (
    <ServerBaseIcon>
        <text dominantBaseline="middle" fill="currentColor" fontSize="6" fontWeight="700" textAnchor="middle" x="18" y="15">APP</text>
        <text dominantBaseline="middle" fill="currentColor" fontSize="5" fontWeight="600" textAnchor="middle" x="18" y="25">SVC</text>
    </ServerBaseIcon>
);

const ServerFileIcon = () => (
    <S>
        <rect fill="currentColor" fillOpacity=".12" height="22" rx="2.5" width="18" x="7" y="9" />
        <rect height="22" rx="2.5" stroke="currentColor" strokeWidth="1.5" width="18" x="7" y="9" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" x1="10" x2="22" y1="15" y2="15" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" x1="10" x2="22" y1="19" y2="19" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" x1="10" x2="18" y1="23" y2="23" />
        <rect fill="currentColor" fillOpacity=".12" height="14" rx="2" width="10" x="23" y="13" />
        <rect height="14" rx="2" stroke="currentColor" strokeWidth="1.4" width="10" x="23" y="13" />
        <circle cx="28" cy="18" fill="currentColor" r="2" />
        <circle cx="28" cy="23" fill="currentColor" r="1.2" />
    </S>
);

const ServerDnsIcon = () => (
    <ServerBaseIcon>
        <text dominantBaseline="middle" fill="currentColor" fontSize="6" fontWeight="700" textAnchor="middle" x="18" y="15">DNS</text>
        <text dominantBaseline="middle" fill="currentColor" fontSize="5" fontWeight="600" textAnchor="middle" x="18" y="25">:53</text>
    </ServerBaseIcon>
);

const ServerDhcpIcon = () => (
    <ServerBaseIcon>
        <text dominantBaseline="middle" fill="currentColor" fontSize="5.5" fontWeight="700" textAnchor="middle" x="18" y="15">DHCP</text>
        <text dominantBaseline="middle" fill="currentColor" fontSize="5" fontWeight="600" textAnchor="middle" x="18" y="25">:67</text>
    </ServerBaseIcon>
);

const ServerNasIcon = () => (
    <S>
        <rect fill="currentColor" fillOpacity=".12" height="24" rx="3" width="22" x="9" y="8" />
        <rect height="24" rx="3" stroke="currentColor" strokeWidth="1.5" width="22" x="9" y="8" />
        <rect fill="currentColor" fillOpacity=".2" height="5" rx="1.5" width="16" x="12" y="12" />
        <rect fill="currentColor" fillOpacity=".2" height="5" rx="1.5" width="16" x="12" y="19" />
        <rect fill="currentColor" fillOpacity=".2" height="5" rx="1.5" width="16" x="12" y="26" />
        <circle cx="25" cy="14.5" fill="currentColor" r="1" />
        <circle cx="25" cy="21.5" fill="currentColor" r="1" />
        <circle cx="25" cy="28.5" fill="currentColor" r="1" />
    </S>
);

const ServerMgmtIcon = () => (
    <ServerBaseIcon>
        <text dominantBaseline="middle" fill="currentColor" fontSize="5.5" fontWeight="700" textAnchor="middle" x="18" y="15">MGMT</text>
        <text dominantBaseline="middle" fill="currentColor" fontSize="5" fontWeight="600" textAnchor="middle" x="18" y="25">NMS</text>
    </ServerBaseIcon>
);

// ── Endpoint ──────────────────────────────────────────────────────────────────

const WorkstationIcon = () => (
    <S>
        <rect fill="currentColor" fillOpacity=".12" height="18" rx="2" width="22" x="9" y="7" />
        <rect height="18" rx="2" stroke="currentColor" strokeWidth="1.5" width="22" x="9" y="7" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" x1="20" x2="20" y1="25" y2="30" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" x1="14" x2="26" y1="30" y2="30" />
        <rect fill="currentColor" fillOpacity=".15" height="10" rx="1" width="16" x="12" y="11" />
    </S>
);

const LaptopIcon = () => (
    <S>
        <rect fill="currentColor" fillOpacity=".12" height="14" rx="2" width="22" x="9" y="8" />
        <rect height="14" rx="2" stroke="currentColor" strokeWidth="1.5" width="22" x="9" y="8" />
        <rect fill="currentColor" fillOpacity=".15" height="8" rx="1" width="16" x="12" y="11" />
        <path d="M6 22 H34 Q35 22 35 23 L35 24 Q35 25 34 25 H6 Q5 25 5 24 L5 23 Q5 22 6 22Z" fill="currentColor" fillOpacity=".2" stroke="currentColor" strokeWidth="1.4" />
    </S>
);

const IpPhoneIcon = () => (
    <S>
        <rect fill="currentColor" fillOpacity=".12" height="26" rx="3" width="18" x="11" y="7" />
        <rect height="26" rx="3" stroke="currentColor" strokeWidth="1.5" width="18" x="11" y="7" />
        <rect fill="currentColor" fillOpacity=".2" height="7" rx="1" width="12" x="14" y="10" />
        <circle cx="17" cy="22" fill="currentColor" r="1.2" />
        <circle cx="20" cy="22" fill="currentColor" r="1.2" />
        <circle cx="23" cy="22" fill="currentColor" r="1.2" />
        <circle cx="17" cy="26" fill="currentColor" r="1.2" />
        <circle cx="20" cy="26" fill="currentColor" r="1.2" />
        <circle cx="23" cy="26" fill="currentColor" r="1.2" />
    </S>
);

const IpCameraIcon = () => (
    <S>
        <rect fill="currentColor" fillOpacity=".12" height="16" rx="3" width="20" x="5" y="12" />
        <rect height="16" rx="3" stroke="currentColor" strokeWidth="1.5" width="20" x="5" y="12" />
        <path d="M25 16 L35 13 V27 L25 24 Z" fill="currentColor" fillOpacity=".2" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
        <circle cx="14" cy="20" fill="currentColor" fillOpacity=".3" r="4" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="14" cy="20" fill="currentColor" r="2" />
    </S>
);

const PrinterIcon = () => (
    <S>
        <rect fill="currentColor" fillOpacity=".12" height="8" rx="2" width="22" x="9" y="16" />
        <rect height="8" rx="2" stroke="currentColor" strokeWidth="1.5" width="22" x="9" y="16" />
        <rect fill="currentColor" fillOpacity=".1" height="8" rx="1.5" width="16" x="12" y="8" />
        <rect height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" width="16" x="12" y="8" />
        <rect fill="currentColor" fillOpacity=".1" height="8" rx="1.5" width="16" x="12" y="24" />
        <rect height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" width="16" x="12" y="24" />
        <circle cx="28" cy="20" fill="currentColor" r="1.5" />
    </S>
);

const IotIcon = () => (
    <S>
        <circle cx="20" cy="22" fill="currentColor" fillOpacity=".15" r="7" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="20" cy="22" fill="currentColor" r="3" />
        <path d="M12 14 Q20 8 28 14" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
        <path d="M9 11 Q20 3 31 11" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.3" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" x1="20" x2="20" y1="15" y2="22" />
    </S>
);

const EncryptorIcon = () => (
    <S>
        {/* data in */}
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" x1="3" x2="10" y1="20" y2="20" />
        <polyline fill="none" points="8,17 10,20 8,23" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        {/* body */}
        <rect fill="currentColor" fillOpacity=".12" height="18" rx="3" stroke="currentColor" strokeWidth="1.6" width="18" x="11" y="11" />
        {/* lock shackle */}
        <path d="M16 18 V15 Q16 12 20 12 Q24 12 24 15 V18" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
        {/* lock body */}
        <rect fill="currentColor" fillOpacity=".3" height="8" rx="2" stroke="currentColor" strokeWidth="1.4" width="10" x="15" y="18" />
        <circle cx="20" cy="22" fill="currentColor" r="1.5" />
        {/* data out */}
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" x1="29" x2="37" y1="20" y2="20" />
        <polyline fill="none" points="34,17 37,20 34,23" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        {/* cipher marks on output side */}
        <line stroke="currentColor" strokeLinecap="round" strokeOpacity=".5" strokeWidth="1.2" x1="32" x2="36" y1="15" y2="15" />
        <line stroke="currentColor" strokeLinecap="round" strokeOpacity=".5" strokeWidth="1.2" x1="33" x2="37" y1="25" y2="25" />
    </S>
);

// ── Wireless ──────────────────────────────────────────────────────────────────

const AccessPointIcon = () => (
    <S>
        <circle cx="20" cy="24" fill="currentColor" fillOpacity=".2" r="3.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M13 17 Q20 12 27 17" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        <path d="M9 13 Q20 6 31 13" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
        <path d="M6 9.5 Q20 1 34 9.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" x1="20" x2="20" y1="20.5" y2="24" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="2" x1="10" x2="30" y1="32" y2="32" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" x1="20" x2="20" y1="27.5" y2="32" />
    </S>
);

const ModemIcon = () => (
    <S>
        <rect fill="currentColor" fillOpacity=".12" height="16" rx="3" width="24" x="8" y="13" />
        <rect height="16" rx="3" stroke="currentColor" strokeWidth="1.5" width="24" x="8" y="13" />
        <circle cx="14" cy="21" fill="currentColor" r="1.5" />
        <circle cx="19" cy="21" fill="currentColor" r="1.5" />
        <circle cx="24" cy="21" fill="currentColor" r="1.5" />
        <path d="M12 9 Q20 5 28 9" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" x1="20" x2="20" y1="9" y2="13" />
    </S>
);

const GatewayIcon = () => (
    <S>
        <rect fill="currentColor" fillOpacity=".12" height="14" rx="3" width="26" x="7" y="15" />
        <rect height="14" rx="3" stroke="currentColor" strokeWidth="1.5" width="26" x="7" y="15" />
        <circle cx="14" cy="22" fill="currentColor" r="1.5" />
        <circle cx="20" cy="22" fill="currentColor" r="1.5" />
        <circle cx="26" cy="22" fill="currentColor" r="1.5" />
        <path d="M13 11 Q20 7 27 11" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
        <path d="M10 8 Q20 3 30 8" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" x1="20" x2="20" y1="11" y2="15" />
    </S>
);

const RadioIcon = () => (
    <S>
        {/* mast */}
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="2" x1="20" x2="20" y1="16" y2="34" />
        {/* base */}
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="2" x1="14" x2="26" y1="34" y2="34" />
        {/* dish / yagi arms */}
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" x1="20" x2="9" y1="20" y2="13" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" x1="20" x2="10" y1="22" y2="17" />
        <line stroke="currentColor" strokeLinecap="round" strokeWidth="1.1" x1="20" x2="11" y1="24" y2="21" />
        {/* signal arcs */}
        <path d="M7 8 Q11 4 15 8" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
        <path d="M4 5 Q11 -1 18 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
        {/* tx dot */}
        <circle cx="8.5" cy="10.5" fill="currentColor" r="1.8" />
    </S>
);

// ── Cloud ─────────────────────────────────────────────────────────────────────

const InternetIcon = () => (
    <S>
        <circle cx="20" cy="20" fill="currentColor" fillOpacity=".08" r="13" stroke="currentColor" strokeWidth="1.5" />
        <ellipse cx="20" cy="20" fill="none" rx="6.5" ry="13" stroke="currentColor" strokeWidth="1.2" />
        <line stroke="currentColor" strokeWidth="1.2" x1="7" x2="33" y1="20" y2="20" />
        <line stroke="currentColor" strokeWidth="1" x1="8.5" x2="31.5" y1="14" y2="14" />
        <line stroke="currentColor" strokeWidth="1" x1="8.5" x2="31.5" y1="26" y2="26" />
    </S>
);

const CloudIcon = () => (
    <S>
        <path d="M10 26 Q6 26 6 21 Q6 16 11 16 Q11 10 17 10 Q21 10 23 13 Q25 11 28 11 Q33 11 33 16 Q36 16 36 21 Q36 26 32 26 Z" fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
    </S>
);

const CdnIcon = () => (
    <S>
        <circle cx="20" cy="20" fill="currentColor" fillOpacity=".08" r="10" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="9" cy="14" fill="currentColor" fillOpacity=".15" r="4" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="31" cy="14" fill="currentColor" fillOpacity=".15" r="4" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="20" cy="32" fill="currentColor" fillOpacity=".15" r="4" stroke="currentColor" strokeWidth="1.3" />
        <line stroke="currentColor" strokeWidth="1.2" x1="12.5" x2="16" y1="15.5" y2="17.5" />
        <line stroke="currentColor" strokeWidth="1.2" x1="27.5" x2="24" y1="15.5" y2="17.5" />
        <line stroke="currentColor" strokeWidth="1.2" x1="20" x2="20" y1="30" y2="30" />
    </S>
);

const SaasIcon = () => (
    <S>
        <path d="M8 24 Q5 24 5 19 Q5 15 9 15 Q9 10 15 10 Q19 10 20 13 Q22 11 25 11 Q30 11 30 15 Q33 15 33 19 Q33 24 30 24 Z" fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.4" />
        <text dominantBaseline="middle" fill="currentColor" fontSize="7" fontWeight="800" textAnchor="middle" x="19" y="30">SaaS</text>
    </S>
);

// ── Registry ──────────────────────────────────────────────────────────────────

const iconMap: Record<string, React.FC> = {
    router: RouterIcon,
    switch: SwitchIcon,
    "switch-l3": SwitchL3Icon,
    hub: HubIcon,
    bridge: BridgeIcon,
    repeater: RepeaterIcon,
    firewall: FirewallIcon,
    "vpn-gateway": VpnGatewayIcon,
    proxy: ProxyIcon,
    ids: IdsIcon,
    "load-balancer": LoadBalancerIcon,
    "server-web": ServerWebIcon,
    "server-database": ServerDatabaseIcon,
    "server-app": ServerAppIcon,
    "server-file": ServerFileIcon,
    "server-dns": ServerDnsIcon,
    "server-dhcp": ServerDhcpIcon,
    "server-nas": ServerNasIcon,
    "server-mgmt": ServerMgmtIcon,
    workstation: WorkstationIcon,
    laptop: LaptopIcon,
    "ip-phone": IpPhoneIcon,
    "ip-camera": IpCameraIcon,
    printer: PrinterIcon,
    iot: IotIcon,
    encryptor: EncryptorIcon,
    "access-point": AccessPointIcon,
    modem: ModemIcon,
    gateway: GatewayIcon,
    radio: RadioIcon,
    internet: InternetIcon,
    cloud: CloudIcon,
    cdn: CdnIcon,
    saas: SaasIcon,
};

export function NetworkNodeIcon({ nodeType }: { nodeType: string }): React.ReactElement {
    const Icon = iconMap[nodeType];

    if (Icon != null) return <Icon />;

    return (
        <svg fill="none" height={40} viewBox="0 0 40 40" width={40} xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" fill="currentColor" fillOpacity=".15" r="13" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    );
}
