import { Property } from '@/types/property';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { defaultTags } from '@/data/defaultChecklist';

interface ReportGeneratorProps {
  property: Property;
}

export const ReportGenerator = ({ property }: ReportGeneratorProps) => {
  const generateReport = () => {
    const completedItems = property.checklist.reduce((acc, cat) => {
      return acc + cat.items.filter((item) => {
        if (item.type === 'checkbox') return item.value === true;
        if (item.type === 'text') return item.value && (item.value as string).trim() !== '';
        if (item.type === 'number') return item.value !== null;
        if (item.type === 'select') return item.value !== null;
        if (item.type === 'rating') return item.value !== null && item.value !== 0;
        return false;
      }).length;
    }, 0);
    const totalItems = property.checklist.reduce((acc, cat) => acc + cat.items.length, 0);
    const progress = Math.round((completedItems / totalItems) * 100);

    const tagLabels = property.tags
      .map((tagId) => defaultTags.find((t) => t.id === tagId)?.label)
      .filter(Boolean)
      .join(', ');

    let report = `
╔══════════════════════════════════════════════════════════════════╗
║              PROPERTY EVALUATION REPORT                         ║
╚══════════════════════════════════════════════════════════════════╝

────────────────────────────────────────────────────────────────────
                       PROPERTY DETAILS
────────────────────────────────────────────────────────────────────

Property Name:    ${property.name}
Address:          ${property.address || 'Not specified'}
Builder:          ${property.builderName || 'Not specified'}
Visit Date:       ${property.visitDate}
Overall Rating:   ${'★'.repeat(property.rating)}${'☆'.repeat(5 - property.rating)} (${property.rating}/5)
Tags:             ${tagLabels || 'None'}
Progress:         ${progress}% (${completedItems}/${totalItems} items completed)

────────────────────────────────────────────────────────────────────
                        CUSTOM NOTES
────────────────────────────────────────────────────────────────────

${property.notes || 'No notes added.'}

`;

    // Add checklist sections
    property.checklist.forEach((category) => {
      const categoryCompleted = category.items.filter((item) => {
        if (item.type === 'checkbox') return item.value === true;
        if (item.type === 'text') return item.value && (item.value as string).trim() !== '';
        if (item.type === 'number') return item.value !== null;
        if (item.type === 'select') return item.value !== null;
        if (item.type === 'rating') return item.value !== null && item.value !== 0;
        return false;
      }).length;

      report += `
════════════════════════════════════════════════════════════════════
${category.icon} ${category.name.toUpperCase()} (${categoryCompleted}/${category.items.length})
════════════════════════════════════════════════════════════════════

`;

      category.items.forEach((item) => {
        let valueStr = '';
        if (item.type === 'checkbox') {
          valueStr = item.value ? '✓ Yes' : '✗ No';
        } else if (item.type === 'rating') {
          const rating = item.value as number || 0;
          valueStr = `${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}`;
        } else if (item.value !== null && item.value !== '') {
          valueStr = String(item.value);
        } else {
          valueStr = '—';
        }

        const redFlagIndicator = item.redFlag && item.value === true ? ' ⚠️ RED FLAG' : '';
        report += `• ${item.label}: ${valueStr}${redFlagIndicator}\n`;
        
        if (item.note) {
          report += `  └─ Note: ${item.note}\n`;
        }
      });
    });

    // Red flags summary
    const redFlags = property.checklist.flatMap((cat) =>
      cat.items.filter((item) => item.redFlag && item.value === true)
    );

    if (redFlags.length > 0) {
      report += `
════════════════════════════════════════════════════════════════════
⚠️  RED FLAGS SUMMARY
════════════════════════════════════════════════════════════════════

`;
      redFlags.forEach((flag) => {
        report += `• ${flag.label}\n`;
      });
    }

    report += `
────────────────────────────────────────────────────────────────────
Generated on: ${new Date().toLocaleString()}
────────────────────────────────────────────────────────────────────
`;

    // Create and download the file
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${property.name.replace(/[^a-z0-9]/gi, '_')}_Report.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      onClick={generateReport}
      variant="outline"
      className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
    >
      <Download className="w-4 h-4" />
      Download Report
    </Button>
  );
};
