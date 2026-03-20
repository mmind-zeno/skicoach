#!/bin/bash
# scaffold.sh — skicoach Projektstruktur anlegen
# Ausführen: bash scaffold.sh

set -e

echo "🎿 skicoach — Projektstruktur wird angelegt..."

dirs=(
  "src/features/calendar/components"
  "src/features/calendar/hooks"
  "src/features/guests/components"
  "src/features/guests/hooks"
  "src/features/invoices/components"
  "src/features/invoices/hooks"
  "src/features/chat/components"
  "src/features/chat/hooks"
  "src/features/auth/components"
  "src/features/admin/components"
  "src/features/booking-public/components"
  "src/features/booking-public/hooks"
  "src/features/payments"
  "src/services"
  "src/lib"
  "src/types"
  "src/components/ui"
  "app/(internal)/kalender"
  "app/(internal)/gaeste"
  "app/(internal)/rechnungen"
  "app/(internal)/chat"
  "app/(internal)/admin"
  "app/(internal)/admin/anfragen"
  "app/(public)/buchen"
  "app/api/bookings"
  "app/api/bookings/[id]"
  "app/api/guests"
  "app/api/guests/[id]"
  "app/api/invoices"
  "app/api/invoices/[id]"
  "app/api/invoices/[id]/pdf"
  "app/api/chat/channels"
  "app/api/chat/messages"
  "app/api/admin/users"
  "app/api/admin/users/[id]"
  "app/api/admin/course-types"
  "app/api/admin/course-types/[id]"
  "app/api/admin/stats"
  "app/api/admin/requests"
  "app/api/admin/requests/count"
  "app/api/admin/requests/[id]"
  "app/api/admin/requests/[id]/confirm"
  "app/api/admin/requests/[id]/reject"
  "app/api/public/course-types"
  "app/api/public/availability"
  "app/api/public/slots"
  "app/api/public/requests"
  "app/api/webhooks/stripe"
  "app/api/auth/[...nextauth]"
  "drizzle/migrations"
  "scripts"
  "backups"
)

for dir in "${dirs[@]}"; do
  mkdir -p "$dir"
  echo "  📁 $dir"
done

# Platzhalter-Dateien (Namen konsistent mit CLAUDE.md / PROMPTS.md)
touch_files=(
  "src/features/calendar/types.ts"
  "src/features/calendar/hooks/useBookings.ts"
  "src/features/calendar/components/CalendarView.tsx"
  "src/features/calendar/components/BookingCreateModal.tsx"
  "src/features/calendar/components/BookingDetailPanel.tsx"
  "src/features/calendar/components/TeacherLegend.tsx"
  "src/features/guests/types.ts"
  "src/features/guests/hooks/useGuests.ts"
  "src/features/guests/components/GuestList.tsx"
  "src/features/guests/components/GuestDetailPanel.tsx"
  "src/features/guests/components/GuestCreateModal.tsx"
  "src/features/invoices/types.ts"
  "src/features/invoices/hooks/useInvoices.ts"
  "src/features/invoices/components/InvoiceList.tsx"
  "src/features/invoices/components/InvoiceDetailModal.tsx"
  "src/features/invoices/components/InvoicePDFTemplate.tsx"
  "src/features/chat/hooks/useChat.ts"
  "src/features/chat/components/ChatLayout.tsx"
  "src/features/chat/components/MessageFeed.tsx"
  "src/features/chat/components/MessageInput.tsx"
  "src/features/admin/components/Dashboard.tsx"
  "src/features/admin/components/TeacherManagement.tsx"
  "src/features/admin/components/CourseTypeManagement.tsx"
  "src/features/admin/components/BookingRequests.tsx"
  "src/features/admin/components/TeacherSelectModal.tsx"
  "src/services/booking.service.ts"
  "src/services/guest.service.ts"
  "src/services/invoice.service.ts"
  "src/services/pdf.service.ts"
  "src/services/chat.service.ts"
  "src/services/admin.service.ts"
  "src/services/availability.service.ts"
  "src/services/booking-request.service.ts"
  "src/services/payment.service.ts"
  "src/lib/db.ts"
  "src/lib/auth.ts"
  "src/lib/socket.ts"
  "src/lib/errors.ts"
  "src/lib/mail.ts"
  "src/lib/colors.ts"
  "src/types/index.ts"
  "drizzle/schema.ts"
  "drizzle.config.ts"
  "src/middleware.ts"
  "server.ts"
)

for file in "${touch_files[@]}"; do
  touch "$file"
  echo "  📄 $file"
done

cat > .gitignore << 'EOF'
node_modules/
.pnp
.pnp.js
.next/
out/
dist/
build/
.env
.env.local
.env.production
.env.*.local
drizzle/migrations/*.sql.bak
*.log
npm-debug.log*
.DS_Store
Thumbs.db
.vscode/
.idea/
*.swp
backups/
public/invoices/
EOF
echo "  📄 .gitignore"

echo ""
echo "────────────────────────────────────────────────────────"
echo "✅ Struktur angelegt."
echo "  • CLAUDE.md + PROMPTS.md liegen im Ordner (nicht überschreiben)."
echo "  • .env.example aus Repo verwenden / anpassen."
echo "  • Nächster Schritt: PROMPTS.md Prompt 1 (Next.js Scaffold)."
echo "────────────────────────────────────────────────────────"
