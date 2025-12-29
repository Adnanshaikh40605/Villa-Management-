// Script to replace all Lucide imports with Heroicons in UI components
const fs = require('fs');
const path = require('path');

const replacements = {
  'Calendar as CalendarIcon': 'CalendarIcon',
  'PanelLeft': 'Bars3BottomLeftIcon',
  'X': 'XMarkIcon',
  'GripVertical': 'Bars3Icon',
  'Circle': 'CircleIcon',
  'ChevronLeft': 'ChevronLeftIcon',
  'ChevronRight': 'ChevronRightIcon',
  'MoreHorizontal': 'EllipsisHorizontalIcon',
  'ChevronDown': 'ChevronDownIcon',
  'Check': 'CheckIcon',
  'Dot': 'EllipsisHorizontalIcon',
  'ArrowLeft': 'ArrowLeftIcon',
  'ArrowRight': 'ArrowRightIcon',
};

const files = [
  'src/components/ui/date-picker.tsx',
  'src/components/ui/sidebar.tsx',
  'src/components/ui/toast.tsx',
  'src/components/ui/sheet.tsx',
  'src/components/ui/resizable.tsx',
  'src/components/ui/radio-group.tsx',
  'src/components/ui/pagination.tsx',
  'src/components/ui/navigation-menu.tsx',
  'src/components/ui/menubar.tsx',
  'src/components/ui/input-otp.tsx',
  'src/components/ui/dialog.tsx',
  'src/components/ui/dropdown-menu.tsx',
  'src/components/ui/context-menu.tsx',
  'src/components/ui/checkbox.tsx',
  'src/components/ui/carousel.tsx',
  'src/components/ui/calendar.tsx',
  'src/components/ui/breadcrumb.tsx',
  'src/components/ui/accordion.tsx',
];

console.log('Replacing Lucide imports with Heroicons...');
