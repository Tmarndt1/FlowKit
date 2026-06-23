import { NetworkCategory, NetworkPreset } from "./types";

export const networkNodeWidth = 120;
export const networkNodeHeight = 130;

export const networkPresets: NetworkPreset[] = [
    // ── Infrastructure ──────────────────────────────────────
    {
        category: "infrastructure",
        description: "Routes traffic between networks using IP addresses",
        icon: "router",
        label: "Router",
        type: "router",
    },
    {
        category: "infrastructure",
        description: "Connects devices within a network at Layer 2",
        icon: "switch",
        label: "Switch",
        type: "switch",
    },
    {
        category: "infrastructure",
        description: "Switches with routing capability at Layer 3",
        icon: "switch-l3",
        label: "L3 Switch",
        type: "switch-l3",
    },
    {
        category: "infrastructure",
        description: "Broadcasts traffic to all connected ports",
        icon: "hub",
        label: "Hub",
        type: "hub",
    },
    {
        category: "infrastructure",
        description: "Connects two network segments at the data link layer",
        icon: "bridge",
        label: "Bridge",
        type: "bridge",
    },
    {
        category: "infrastructure",
        description: "Repeats signals between network segments",
        icon: "repeater",
        label: "Repeater",
        type: "repeater",
    },
    // ── Security ────────────────────────────────────────────
    {
        category: "security",
        description: "Monitors and controls incoming and outgoing network traffic",
        icon: "firewall",
        label: "Firewall",
        type: "firewall",
    },
    {
        category: "security",
        description: "Extends a private network across a public network",
        icon: "vpn-gateway",
        label: "VPN Gateway",
        type: "vpn-gateway",
    },
    {
        category: "security",
        description: "Intermediary server for requests between clients and servers",
        icon: "proxy",
        label: "Proxy",
        type: "proxy",
    },
    {
        category: "security",
        description: "Monitors network traffic for suspicious activity",
        icon: "ids",
        label: "IDS / IPS",
        type: "ids",
    },
    {
        category: "security",
        description: "Distributes incoming traffic across multiple servers",
        icon: "load-balancer",
        label: "Load Balancer",
        type: "load-balancer",
    },
    // ── Server ──────────────────────────────────────────────
    {
        category: "server",
        description: "Serves HTTP/HTTPS content to clients",
        icon: "server-web",
        label: "Web Server",
        type: "server-web",
    },
    {
        category: "server",
        description: "Stores and queries structured data",
        icon: "server-database",
        label: "Database",
        type: "server-database",
    },
    {
        category: "server",
        description: "Hosts application logic and business services",
        icon: "server-app",
        label: "App Server",
        type: "server-app",
    },
    {
        category: "server",
        description: "Provides shared file storage over the network",
        icon: "server-file",
        label: "File Server",
        type: "server-file",
    },
    {
        category: "server",
        description: "Resolves domain names to IP addresses",
        icon: "server-dns",
        label: "DNS Server",
        type: "server-dns",
    },
    {
        category: "server",
        description: "Assigns IP addresses to devices on the network",
        icon: "server-dhcp",
        label: "DHCP Server",
        type: "server-dhcp",
    },
    {
        category: "server",
        description: "Network-attached storage for centralized file access",
        icon: "server-nas",
        label: "NAS",
        type: "server-nas",
    },
    {
        category: "server",
        description: "Manages and monitors network devices",
        icon: "server-mgmt",
        label: "Mgmt Server",
        type: "server-mgmt",
    },
    // ── Endpoint ────────────────────────────────────────────
    {
        category: "endpoint",
        description: "Desktop computer connected to the network",
        icon: "workstation",
        label: "Workstation",
        type: "workstation",
    },
    {
        category: "endpoint",
        description: "Portable computer connected to the network",
        icon: "laptop",
        label: "Laptop",
        type: "laptop",
    },
    {
        category: "endpoint",
        description: "VoIP telephone device",
        icon: "ip-phone",
        label: "IP Phone",
        type: "ip-phone",
    },
    {
        category: "endpoint",
        description: "Network-connected surveillance camera",
        icon: "ip-camera",
        label: "IP Camera",
        type: "ip-camera",
    },
    {
        category: "endpoint",
        description: "Network printer or multifunction device",
        icon: "printer",
        label: "Printer",
        type: "printer",
    },
    {
        category: "endpoint",
        description: "Low-power connected sensor or actuator",
        icon: "iot",
        label: "IoT Device",
        type: "iot",
    },
    {
        category: "endpoint",
        description: "Hardware device that encrypts and decrypts network traffic in-line",
        icon: "encryptor",
        label: "Encryptor",
        type: "encryptor",
    },
    // ── Wireless ────────────────────────────────────────────
    {
        category: "wireless",
        description: "Provides wireless network access to clients",
        icon: "access-point",
        label: "Access Point",
        type: "access-point",
    },
    {
        category: "wireless",
        description: "Modulates/demodulates signals for broadband access",
        icon: "modem",
        label: "Modem",
        type: "modem",
    },
    {
        category: "wireless",
        description: "Combines modem, router, and access point functions",
        icon: "gateway",
        label: "Gateway",
        type: "gateway",
    },
    {
        category: "wireless",
        description: "Point-to-point or point-to-multipoint radio link",
        icon: "radio",
        label: "Radio",
        type: "radio",
    },
    // ── Cloud ───────────────────────────────────────────────
    {
        category: "cloud",
        description: "Public internet or WAN connection",
        icon: "internet",
        label: "Internet",
        type: "internet",
    },
    {
        category: "cloud",
        description: "Public or private cloud service provider",
        icon: "cloud",
        label: "Cloud",
        type: "cloud",
    },
    {
        category: "cloud",
        description: "Content delivery network for distributed caching",
        icon: "cdn",
        label: "CDN",
        type: "cdn",
    },
    {
        category: "cloud",
        description: "Software-as-a-Service application endpoint",
        icon: "saas",
        label: "SaaS",
        type: "saas",
    },
];

export const networkCategoryLabels: Record<NetworkCategory, string> = {
    infrastructure: "Infrastructure",
    security: "Security",
    server: "Server",
    endpoint: "Endpoint",
    wireless: "Wireless",
    cloud: "Cloud",
};

export const networkPresetByType = new Map(networkPresets.map((preset) => [preset.type, preset]));
