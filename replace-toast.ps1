# Replace useToast with toast utility in all pages

# Villas.tsx
(Get-Content 'src/pages/Villas.tsx') `
  -replace "import \{ useToast \} from '@/hooks/use-toast';", "import { toast } from '@/lib/toast';" `
  -replace "const \{ toast \} = useToast\(\);", "" `
  -replace "toast\(\{\s+title: 'Error',\s+description: '([^']+)',\s+variant: 'destructive',\s+\}\);", "toast.error('`$1');" `
  -replace "toast\(\{\s+title: 'Success',\s+description: '([^']+)',\s+\}\);", "toast.success('`$1');" `
  | Set-Content 'src/pages/Villas.tsx'

# Bookings.tsx
(Get-Content 'src/pages/Bookings.tsx') `
  -replace "import \{ useToast \} from '@/hooks/use-toast';", "import { toast } from '@/lib/toast';" `
  -replace "const \{ toast \} = useToast\(\);", "" `
  -replace "toast\(\{\s+title: 'Error',\s+description: '([^']+)',\s+variant: 'destructive',\s+\}\);", "toast.error('`$1');" `
  -replace "toast\(\{\s+title: 'Success',\s+description: '([^']+)',\s+\}\);", "toast.success('`$1');" `
  | Set-Content 'src/pages/Bookings.tsx'

# BookingCalendar.tsx
(Get-Content 'src/pages/BookingCalendar.tsx') `
  -replace "import \{ useToast \} from '@/hooks/use-toast';", "import { toast } from '@/lib/toast';" `
  -replace "const \{ toast \} = useToast\(\);", "" `
  -replace "toast\(\{\s+title: 'Error',\s+description: '([^']+)',\s+variant: 'destructive',\s+\}\);", "toast.error('`$1');" `
  -replace "toast\(\{\s+title: 'Success',\s+description: '([^']+)',\s+\}\);", "toast.success('`$1');" `
  | Set-Content 'src/pages/BookingCalendar.tsx'

# Login.tsx
(Get-Content 'src/pages/Login.tsx') `
  -replace "import \{ useToast \} from '@/hooks/use-toast';", "import { toast } from '@/lib/toast';" `
  -replace "const \{ toast \} = useToast\(\);", "" `
  -replace "toast\(\{\s+title: 'Error',\s+description: '([^']+)',\s+variant: 'destructive',\s+\}\);", "toast.error('`$1');" `
  -replace "toast\(\{\s+title: 'Success',\s+description: '([^']+)',\s+\}\);", "toast.success('`$1');" `
  | Set-Content 'src/pages/Login.tsx'

Write-Host "Toast replacement complete!"
