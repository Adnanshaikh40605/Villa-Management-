import os
import re

# Icon mappings
icon_map = {
    'X': 'XMarkIcon',
    'Check': 'CheckIcon',
    'ChevronLeft': 'ChevronLeftIcon',
    'ChevronRight': 'ChevronRightIcon',
    'ChevronDown': 'ChevronDownIcon',
    'ChevronUp': 'ChevronUpIcon',
    'Circle': 'CircleIcon',
    'MoreHorizontal': 'EllipsisHorizontalIcon',
    'ArrowLeft': 'ArrowLeftIcon',
    'ArrowRight': 'ArrowRightIcon',
    'GripVertical': 'Bars3Icon',
    'PanelLeft': 'Bars3BottomLeftIcon',
    'Dot': 'EllipsisHorizontalIcon',
    'Calendar as CalendarIcon': 'CalendarIcon',
}

ui_dir = 'src/components/ui'

for filename in os.listdir(ui_dir):
    if filename.endswith('.tsx'):
        filepath = os.path.join(ui_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace import
        content = re.sub(r'from "lucide-react"', 'from "@heroicons/react/24/outline"', content)
        
        # Replace icon usages
        for old_icon, new_icon in icon_map.items():
            # Replace in JSX tags
            content = re.sub(rf'<{old_icon}\s', f'<{new_icon} ', content)
            # Replace in imports
            content = re.sub(rf'\b{old_icon}\b', new_icon, content)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

print("All UI components updated!")
