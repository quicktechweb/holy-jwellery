import {
  Activity,
  BarChart3,
  ClipboardCheck,
  Globe,
  Inbox,
  LayoutDashboard,
  ListChecks,
  Megaphone,
  MessageCircle,
  MessageSquare,
  Package,
  PhoneCall,
  Search,
  ShoppingCart,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

export interface NavChild {
  label: string;
  href: string;
}
export interface NavItem {
  label: string;
  icon: LucideIcon;
  href?: string;
  children?: NavChild[];
}
export interface NavSection {
  title?: string;
  items: NavItem[];
}

const routes: Record<string, string> = {
  'New Order': '/dashboard/orders/new',
  'Web Order List': '/dashboard/orders/web',
  'Auto Pick Orders': '/dashboard/orders/auto',
  'Auto Call Center': '/dashboard/orders/auto-call',
  'Order Block List': '/dashboard/orders/block-list',
  'Order List': '/dashboard/orders/list',
  'Orders Dashboard': '/dashboard/orders/report',
  Preorders: '/dashboard/orders/preorders',
  'Super Edit': '/dashboard/orders/super-edit',
  'Scan To Update': '/dashboard/orders/scan-to-update',
  'Courier Invoice Upload': '/dashboard/orders/courier-payment',
  'Courier Management': '/dashboard/orders/courier-management',
  'Inventory Dashboard': '/dashboard/inventory',
  Products: '/dashboard/product/product-list',
  'Add Product': '/dashboard/product/new-product',
  'Stock Ledger': '/dashboard/inventory/stock-ledger',
  'Low Stock Alert': '/dashboard/inventory/low-stock-alert',
  'Product Report': '/dashboard/reports/product-report',
  Inbox: '/dashboard/messages',
  Comments: '/dashboard/messages/comments',
  Report: '/dashboard/messages/report',
  'Purchase Dashboard': '/dashboard/purchase/dashboard',
  'Purchase List': '/dashboard/purchase/list',
  'Purchase Order': '/dashboard/purchase/new',
  'Ask for Quotation': '/dashboard/purchase/quotation',
  'Purchase Receive': '/dashboard/purchase/receive',
  Suppliers: '/dashboard/purchase/suppliers',
  'Supplier Ledger': '/dashboard/purchase/ledger',
  'Task Board': '/dashboard/task/task-list',
  'Agent Cockpit': '/dashboard/followups/cockpit',
  'Follow-up Management': '/dashboard/followups/management',
  'My Follow-ups': '/dashboard/followups/my',
  'Follow-up Performance': '/dashboard/followups/performance',
  'Call Recordings': '/dashboard/call-center/recordings',
  'Call Center Setup': '/dashboard/call-center/setup',
  'My Work': '/dashboard/work-inbox/my-work',
  'Work Control': '/dashboard/work-inbox/control',
  'Work Inbox Settings': '/dashboard/work-inbox/settings',
  'Ads Dashboard': '/dashboard/ads',
  'Ad Profit Analysis': '/dashboard/ads/profit',
  'Meta Ads': '/dashboard/ads/meta',
  'TikTok Ads': '/dashboard/ads/tiktok',
  'Google Ads': '/dashboard/ads/google',
  'Ad Spend': '/dashboard/ads/spend',
};

const kids = (...labels: string[]): NavChild[] =>
  labels.map((label) => ({ label, href: routes[label] ?? '#' }));

export const navSections: NavSection[] = [
  {
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
      { label: 'Search', icon: Search, href: '#' },
    ],
  },
  {
    title: 'Operations',
    items: [
      {
        label: 'Web Orders',
        icon: Globe,
        children: kids(
          'New Order',
          'Web Order List',
          'Auto Pick Orders',
          'Auto Call Center',
          'Order Block List',
        ),
      },
      {
        label: 'Approved Orders',
        icon: ClipboardCheck,
        children: kids(
          'Order List',
          'Orders Dashboard',
          'Preorders',
          'Super Edit',
          'Scan To Update',
          'Courier Invoice Upload',
          'Courier Management',
        ),
      },
      {
        label: 'Inventory',
        icon: Package,
        children: kids('Inventory Dashboard', 'Products', 'Add Product', 'Stock Ledger', 'Branches', 'Stock Transfer', 'Low Stock Alert'),
      },
      { label: 'Messages', icon: MessageCircle, children: kids('Inbox', 'Comments', 'Auto Replies', 'AI Reply', 'Report') },
      {
        label: 'Purchase',
        icon: ShoppingCart,
        children: kids('Purchase Dashboard', 'Purchase List', 'Purchase Order', 'Ask for Quotation', 'Purchase Receive', 'Suppliers', 'Supplier Ledger'),
      },
      {
        label: 'Task & Follow-up',
        icon: ListChecks,
        children: kids('Task Board', 'Agent Cockpit', 'Follow-up Management', 'My Follow-ups', 'Follow-up Performance'),
      },
      { label: 'Call Center', icon: PhoneCall, children: kids('Call Recordings', 'Call Center Setup') },
      { label: 'Work Inbox', icon: Inbox, children: kids('My Work', 'Work Control', 'Work Inbox Settings') },
    ],
  },
  {
    title: 'Growth',
    items: [
      { label: 'Ads', icon: Megaphone, children: kids('Ads Dashboard', 'Ad Profit Analysis', 'Meta Ads', 'TikTok Ads', 'Google Ads', 'Ad Spend') },
      { label: 'Marketing', icon: MessageSquare, children: kids('SMS', 'Coupons') },
      { label: 'Customers', icon: Users, children: kids('Customer List', 'Segments') },
    ],
  },
  {
    title: 'Business Control',
    items: [
      { label: 'HRM', icon: Activity, children: kids('Employees', 'Attendance') },
      { label: 'Finance', icon: Wallet, children: kids('Expenses', 'Payouts') },
      {
        label: 'Reports',
        icon: BarChart3,
        children: kids('Product Report', 'Sales Report', 'Profit Report'),
      },
    ],
  },
];

export const quickActions: { label: string; icon: LucideIcon; href: string }[] = [
  { label: 'Search', icon: Search, href: '#' },
  { label: 'New Order', icon: ShoppingCart, href: '/dashboard/orders/new' },
  { label: 'Web Order List', icon: Globe, href: '/dashboard/orders/web' },
  { label: 'Order List', icon: ListChecks, href: '/dashboard/orders/list' },
  { label: 'Send Message', icon: MessageSquare, href: '#' },
];

export const dashboardTabs = [
  'My Dashboard',
  'Overview',
  'Decision',
  'Operations',
  'Products',
  'Marketing',
  'Customers & Team',
  'Activity',
];

export const dateOptions = [
  'Today',
  'Yesterday',
  'Last 7 days',
  'Last 30 days',
  'This month',
  'Last month',
];
export const statusOptions = ['Approved', 'Pending', 'Processing', 'Cancelled'];

/** href current pathname er sathe match kore kina (child route soho) */
export const isActiveHref = (href: string | undefined, pathname: string) =>
  !!href &&
  href !== '#' &&
  (pathname === href || (href !== '/dashboard/ads' && pathname.startsWith(`${href}/`)));
