import * as React from "react";

const S = (props: React.SVGProps<SVGSVGElement>) => (
    <svg fill="none" height={36} viewBox="0 0 40 40" width={36} xmlns="http://www.w3.org/2000/svg" {...props} />
);

// ── Infrastructure ────────────────────────────────────────────────────────────

const RouterIcon = () => (
    <S>
        {/* router-svgrepo-com.svg — colors replaced with currentColor tiers, white arrows */}
        <g transform="translate(2.3, 5) scale(0.0345)">
           <path d="M77 403.4v228.5c1.5 93.7 195.7 183.5 435 183.5s433.4-89.8 435-183.5V403.4H77z" fill="#1B9BDB" />
           <path d="M947 402.7c0 99.4-194.8 194-435 194s-435-94.6-435-194 194.8-180 435-180 435 80.5 435 180z" fill="#3ED6FF" />
           <path d="M474.1 311.4H503l0.1 63.2h29.5l-0.7-63.2h28.9l-43.7-75.1zM533 417.2h-29.9l0.1 73.9h-30.6l46.2 75.2 45.5-75.2h-30.6zM654.5 380.9l-1.4-30-72.1 45 76.4 45.1-1.4-30h126.2l-2.6-30.1zM381.1 380.9h-125l-2.3 30.1H380l-1.1 30 75.9-45.1-72.5-45z" fill="#FFFFFF" />
        </g>
    </S>
);

const SwitchIcon = () => (
    <S>
        {/* switch-svgrepo-com.svg — 1024×1024 scaled to 40×40 */}
        <g transform="scale(0.0390625)">
            {/* left face */}
            <path d="M537 820.3l-470-230v-222l470 212z" fill="currentColor" fillOpacity=".25" />
            {/* right face (darker for 3D depth) */}
            <path d="M537 820.3l420-230v-220l-420 210z" fill="currentColor" fillOpacity=".45" />
            {/* top face */}
            <path d="M67 368.3l470 212 420-210-494.4-166.6z" fill="currentColor" fillOpacity=".12" />
            {/* bidirectional flow arrows */}
            <path d="M532 266.7l-117.1-7.1 28.7 48 29.5-13.6 102.7 39.2 29.6-14.4-102.9-38.4z" fill="currentColor" />
            <path d="M406.8 324.6L290.2 315l28.3 50.4 29.4-13.6L450 394.5l29.6-14.4-102.2-41.9z" fill="currentColor" />
            <path d="M605.8 438.1l117.4 5.8-28-52.2-29.8 15.5-102.5-40.5-29.6 14.7 102.3 41.2z" fill="currentColor" />
            <path d="M538.8 472.9L437 429l-29.7 14.7 101.8 44.6-29.8 15.5 116.9 8.2-27.6-54.6z" fill="currentColor" />
        </g>
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
        {/* firewall-fire-svgrepo-com.svg — 1024×1024 scaled to 40×40 */}
        <g transform="scale(0.0390625)">
            {/* front face */}
            <path d="M762.1 944.8l-660-230v-552l660 192z" fill="currentColor" fillOpacity=".2" />
            {/* right side face (darker) */}
            <path d="M762.1 944.8l160-170v-550l-160 130z" fill="currentColor" fillOpacity=".4" />
            {/* top face */}
            <path d="M102.1 162.8l660 192 160-130L297.7 68.2z" fill="currentColor" fillOpacity=".12" />
            {/* grid / rule lines on front face */}
            <path d="M922.1 399.4v-25.7l-160 129.7v2.7l-244.3-74.8V297.6h-20v127.6l-262-80.2V210.7h-20v128.1L102.1 304v20.9l233.7 71.5v112l-233.7-74.9v21l113.7 36.4v121.9l-113.7-36.4v21l233.7 74.9v123.9l20 7V678.8l280 89.7v132.3l20 7V774.9L762.1 809v2.3l160-153.8v-28.6l-160 153.8v5.3l-244.3-78.3V587.8l244.3 78.3v1.4l160-141.8v-27.1l-160 141.8v4.8l-106.3-34.1V494.4L762.1 527v2.1l160-129.7zM497.8 703.3l-262-84V497.5l262 84v121.8z m138-98.6l-280-89.7V402.6l280 85.7v116.4z" fill="currentColor" fillOpacity=".7" />
            {/* flame / fire glow at base */}
            <path d="M82.1 637.5s27.9-8 39.9-64 22-126 22-126 38 134 72 160c32.4 24.8 26-52 80-102s111-34 117-34-138.6 105.7-42 174c58 41 86-26 126-74s54-25 54-25-18 147 18 143 78-90 78-90 61 91 83 201 12.1 171.3 12.1 171.3l-660-233V637.5z" fill="currentColor" fillOpacity=".35" />
        </g>
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
        {/* database-svgrepo-com.svg — 1024×1024 scaled to 40×40 */}
        <g transform="scale(0.0390625)">
            {/* bottom cylinder side */}
            <path d="M117 608.4v178.5c1.5 93.7 155.7 169.5 395 169.5s393.4-75.8 395-169.5V608.4H117z" fill="currentColor" fillOpacity=".3" />
            {/* bottom cylinder top face */}
            <path d="M907 607.7c0 99.4-154.8 180-395 180s-395-80.6-395-180 154.8-180 395-180 395 80.5 395 180z" fill="currentColor" fillOpacity=".1" />
            {/* middle cylinder side */}
            <path d="M117 428.4v158.5c1.5 93.7 155.7 179.5 395 179.5s393.4-85.8 395-179.5V428.4H117z" fill="currentColor" fillOpacity=".3" />
            {/* middle cylinder top face */}
            <path d="M907 427.7c0 99.4-154.8 180-395 180s-395-80.6-395-180 154.8-180 395-180 395 80.5 395 180z" fill="currentColor" fillOpacity=".1" />
            {/* top cylinder side */}
            <path d="M117 248.4v158.5c1.5 93.7 155.7 179.5 395 179.5s393.4-85.8 395-179.5V248.4H117z" fill="currentColor" fillOpacity=".3" />
            {/* top face (accent) */}
            <path d="M907 247.7c0 99.4-154.8 180-395 180s-395-80.6-395-180 154.8-180 395-180 395 80.5 395 180z" fill="currentColor" fillOpacity=".18" />
        </g>
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
        {/* monitor-svgrepo-com.svg — 1024×1024 scaled to 40×40 */}
        <g transform="scale(0.0390625)">
            {/* monitor screen face */}
            <path d="M884 792.4L114 584.9v-491l770 162.5z" fill="currentColor" fillOpacity=".2" />
            {/* right side */}
            <path d="M909 751.9l-25 40.5v-536l26-27.5z" fill="currentColor" fillOpacity=".4" />
            {/* top face */}
            <path d="M910 228.9L151.4 74.7 114 93.9l770 162.5z" fill="currentColor" fillOpacity=".12" />
            {/* screen bezel / frame */}
            <path d="M114 93.9v491l770 207.5v-536L114 93.9z m755.6 616.5l-746-192.5V106l746 161v443.4z" fill="currentColor" fillOpacity=".3" />
            {/* inner screen area */}
            <path d="M853.3 703.6l-213-485.8 229.1 49.3-0.1 441z" fill="currentColor" fillOpacity=".15" />
            {/* stand base area */}
            <path d="M628.9 935.1L213.8 797.8l165-130 389.1 107.3z" fill="currentColor" fillOpacity=".3" />
            <path d="M767.9 775.1V788l-139 161.3v-14.2z" fill="currentColor" fillOpacity=".45" />
            {/* foot */}
            <path d="M628.9 949.3v-14.2L213.8 797.8v13.9z" fill="currentColor" fillOpacity=".2" />
            {/* port indicators */}
            <path d="M850.8 724.5v17l-39.5-11V714z" fill="currentColor" fillOpacity=".5" />
            <path d="M787.6 708v17l-39.5-11v-16.5z" fill="currentColor" fillOpacity=".5" />
        </g>
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
        {/* SVG source: radio-station-signal-antena-tower, original viewBox 0 0 32 32
            Translated by (4,4) to center within the 40×40 viewBox */}
        <g fill="currentColor" transform="translate(4, 4)">
            <path d="M26.7,2.3c-0.4-0.4-1-0.4-1.4,0s-0.4,1,0,1.4c3.5,3.5,3.5,9.1,0,12.6c-0.4,0.4-0.4,1,0,1.4c0.2,0.2,0.5,0.3,0.7,0.3s0.5-0.1,0.7-0.3C31,13.5,31,6.5,26.7,2.3z" />
            <path d="M22,12.6c-0.4,0.4-0.4,1,0,1.4c0.2,0.2,0.5,0.3,0.7,0.3s0.5-0.1,0.7-0.3c1.1-1.1,1.7-2.5,1.6-4.1c0-1.5-0.7-3-1.8-4.1c-0.4-0.4-1-0.4-1.4,0s-0.4,1,0,1.4C23.3,8.7,23.4,11.2,22,12.6z" />
            <path d="M6.7,16.3c-3.5-3.5-3.5-9.1,0-12.6c0.4-0.4,0.4-1,0-1.4s-1-0.4-1.4,0C1,6.5,1,13.5,5.3,17.7C5.5,17.9,5.7,18,6,18s0.5-0.1,0.7-0.3C7.1,17.3,7.1,16.7,6.7,16.3z" />
            <path d="M8.8,14.2c0.2,0.2,0.5,0.3,0.7,0.3s0.5-0.1,0.7-0.3c0.4-0.4,0.4-1,0-1.4c-1.5-1.5-1.6-4-0.2-5.4c0.4-0.4,0.4-1,0-1.4S9,5.6,8.6,6C7.5,7.1,7,8.5,7,10.1C7,11.6,7.7,13.1,8.8,14.2z" />
            <path d="M24,28h-2.2l-4-15.6C18.5,11.9,19,11,19,10c0-1.7-1.3-3-3-3s-3,1.3-3,3c0,1,0.5,1.9,1.3,2.4l-4,15.6H8c-0.6,0-1,0.4-1,1s0.4,1,1,1h16c0.6,0,1-0.4,1-1S24.6,28,24,28z M17.6,20h-3.3l1.6-6.3L17.6,20z M13.9,22c0,0,0.1,0,0.1,0h4c0.1,0,0.1,0,0.1,0l1.6,6h-7.4L13.9,22z" />
        </g>
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
        <svg fill="none" height={36} viewBox="0 0 40 40" width={36} xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" fill="currentColor" fillOpacity=".15" r="13" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    );
}
