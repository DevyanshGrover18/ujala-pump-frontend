import React from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileText, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';

const TableExportButtons = ({
    tableSelector = 'table',
    exportName = 'Report',
    exportData = null,
    exportHeaders = null,
    pdfOrientation = 'l',
    pdfSize = 'a4'
}) => {

    const getVisibleTable = () => {
        // ... (unchanged helper string matches previous except context) ...
        if (tableSelector !== 'table') {
            const specificTable = document.querySelector(tableSelector);
            if (specificTable) return specificTable;
        }
        const tables = Array.from(document.querySelectorAll('table'));
        const visibleTables = tables.filter((table) => table.offsetParent !== null);
        if (visibleTables.length === 0) return null;
        const tablesInModals = visibleTables.filter((table) => table.closest('.fixed'));
        if (tablesInModals.length > 0) return tablesInModals[tablesInModals.length - 1];
        return visibleTables[0];
    };

    const prepareTableForExport = (originalTable) => {
        const table = originalTable.cloneNode(true);

        // 1. Fix <select> dropdowns (Status columns etc) - replace with just their selected text
        const selects = table.querySelectorAll('select');
        selects.forEach((select) => {
            const selectedText = select.options[select.selectedIndex]?.text || '';
            const textNode = document.createTextNode(selectedText);
            select.parentNode.replaceChild(textNode, select);
        });

        // 2. Remove "Actions" column or Checkbox columns
        const thead = table.querySelector('thead');
        if (thead) {
            const headers = Array.from(thead.querySelectorAll('th, td'));
            const columnsToRemove = [];

            headers.forEach((th, index) => {
                const text = (th.textContent || '').trim().toLowerCase();
                // Check if it's an action column, a select checkbox column, or an empty column
                if (text === 'action' || text === 'actions' || text === 'select' || text === '') {
                    columnsToRemove.push(index);
                }
            });

            // Remove corresponding cells in reverse order to not shift index positions
            columnsToRemove.reverse().forEach((colIndex) => {
                // Remove header cell
                if (headers[colIndex]) {
                    headers[colIndex].remove();
                }

                // Remove column from body/footers
                const rows = table.querySelectorAll('tbody tr, tfoot tr');
                rows.forEach((row) => {
                    const cells = Array.from(row.children);
                    if (cells[colIndex]) {
                        cells[colIndex].remove();
                    }
                });
            });
        }

        return table;
    };

    const exportToExcel = () => {
        try {
            let wb;
            if (exportData && Array.isArray(exportData) && exportData.length > 0) {
                const ws = XLSX.utils.json_to_sheet(exportData);
                wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Data");
            } else {
                const table = getVisibleTable();
                if (!table) {
                    toast.error('No table data currently found to export.');
                    return;
                }
                const cleanTable = prepareTableForExport(table);
                wb = XLSX.utils.table_to_book(cleanTable, { sheet: "Data" });
            }
            XLSX.writeFile(wb, `${exportName}.xlsx`);
            toast.success('Successfully exported to Excel');
        } catch (err) {
            console.error(err);
            toast.error('Failed to export to Excel');
        }
    };

    const exportToPDF = () => {
        try {
            const doc = new jsPDF(pdfOrientation, 'pt', pdfSize); // Landscape layout is usually better for data tables

            if (exportData && Array.isArray(exportData) && exportData.length > 0) {
                const head = exportHeaders ? [exportHeaders] : [Object.keys(exportData[0])];
                const body = exportData.map(item => Object.values(item));

                autoTable(doc, {
                    head: head,
                    body: body,
                    theme: 'grid',
                    styles: { fontSize: 8 },
                    headStyles: { fillColor: [41, 128, 185] }
                });
            } else {
                const table = getVisibleTable();
                if (!table) {
                    toast.error('No table data currently found to export.');
                    return;
                }
                const cleanTable = prepareTableForExport(table);
                autoTable(doc, {
                    html: cleanTable,
                    theme: 'grid',
                    styles: { fontSize: 8 },
                    headStyles: { fillColor: [41, 128, 185] }
                });
            }
            doc.save(`${exportName}.pdf`);
            toast.success('Successfully exported to PDF');
        } catch (err) {
            console.error(err);
            toast.error('Failed to export to PDF');
        }
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={exportToExcel}
                className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition shadow-sm"
                title="Download Table as Excel"
            >
                <FileSpreadsheet className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">Excel</span>
            </button>

            <button
                onClick={exportToPDF}
                className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition shadow-sm"
                title="Download Table as PDF"
            >
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">PDF</span>
            </button>
        </div>
    );
};

export default TableExportButtons;
