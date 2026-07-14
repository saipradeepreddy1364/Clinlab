# generate_report.py
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from test_cases_data import get_test_cases

def generate_excel_report(run_results=None):
    # Retrieve base test cases mapping
    test_cases = get_test_cases()
    
    # Merge run_results if provided
    if run_results:
        for tc in test_cases:
            if tc["id"] in run_results:
                tc["status"] = run_results[tc["id"]]
    
    # Create workbook
    wb = openpyxl.Workbook()
    
    # ── Sheet 1: Dashboard ──────────────────────────────────────────────────
    ws_dash = wb.active
    ws_dash.title = "Summary Dashboard"
    ws_dash.views.sheetView[0].showGridLines = True
    
    # Color palette
    brand_blue = "0EA5E9"
    brand_light_blue = "E0F2FE"
    success_green = "16A34A"
    success_light_green = "DCFCE7"
    white = "FFFFFF"
    gray_border = "CBD5E1"
    
    # Fonts
    title_font = Font(name="Segoe UI", size=18, bold=True, color="0F172A")
    section_font = Font(name="Segoe UI", size=14, bold=True, color="1E293B")
    header_font = Font(name="Segoe UI", size=11, bold=True, color=white)
    bold_font = Font(name="Segoe UI", size=11, bold=True)
    regular_font = Font(name="Segoe UI", size=11)
    
    # Fills
    header_fill = PatternFill(start_color=brand_blue, end_color=brand_blue, fill_type="solid")
    accent_fill = PatternFill(start_color=brand_light_blue, end_color=brand_light_blue, fill_type="solid")
    green_fill = PatternFill(start_color=success_light_green, end_color=success_light_green, fill_type="solid")
    
    # Borders
    thin_side = Side(border_style="thin", color=gray_border)
    border_all = Border(left=thin_side, right=thin_side, top=thin_side, bottom=thin_side)
    double_bottom_side = Side(border_style="double", color="000000")
    total_border = Border(top=thin_side, bottom=double_bottom_side)
    
    # Dashboard Content
    ws_dash["A1"] = "ClinLab End-to-End Test Automation Report"
    ws_dash["A1"].font = title_font
    ws_dash.merge_cells("A1:F1")
    ws_dash.row_dimensions[1].height = 40
    
    ws_dash["A3"] = "Test Run Summary"
    ws_dash["A3"].font = section_font
    
    summary_headers = ["Metric", "Value"]
    for col_idx, h in enumerate(summary_headers, start=1):
        cell = ws_dash.cell(row=4, column=col_idx, value=h)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal="center")
        cell.border = border_all
    
    total_count = len(test_cases)
    passed_count = sum(1 for tc in test_cases if tc["status"] == "Passed")
    failed_count = total_count - passed_count
    pass_rate = (passed_count / total_count) * 100
    
    metrics = [
        ("Total Test Cases", total_count),
        ("Passed Tests", passed_count),
        ("Failed Tests", failed_count),
        ("Pass Rate", f"{pass_rate:.1f}%")
    ]
    
    for idx, (m, val) in enumerate(metrics, start=5):
        c1 = ws_dash.cell(row=idx, column=1, value=m)
        c2 = ws_dash.cell(row=idx, column=2, value=val)
        c1.font = regular_font
        c2.font = bold_font
        c1.border = border_all
        c2.border = border_all
        c1.alignment = Alignment(horizontal="left")
        c2.alignment = Alignment(horizontal="right")
        if m == "Pass Rate":
            c2.fill = green_fill
            c1.fill = green_fill
            
    # Category summary table
    ws_dash["D3"] = "Module Coverage"
    ws_dash["D3"].font = section_font
    
    module_headers = ["Module", "Total Cases", "Passed", "Pass Rate"]
    for col_idx, h in enumerate(module_headers, start=4):
        cell = ws_dash.cell(row=4, column=col_idx, value=h)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal="center")
        cell.border = border_all
        
    modules = sorted(list(set(tc["module"] for tc in test_cases)))
    for idx, mod in enumerate(modules, start=5):
        mod_cases = [tc for tc in test_cases if tc["module"] == mod]
        tot = len(mod_cases)
        pas = sum(1 for tc in mod_cases if tc["status"] == "Passed")
        rate = f"{(pas / tot) * 100:.1f}%"
        
        c1 = ws_dash.cell(row=idx, column=4, value=mod)
        c2 = ws_dash.cell(row=idx, column=5, value=tot)
        c3 = ws_dash.cell(row=idx, column=6, value=pas)
        c4 = ws_dash.cell(row=idx, column=7, value=rate)
        
        for c in [c1, c2, c3, c4]:
            c.font = regular_font
            c.border = border_all
        c1.alignment = Alignment(horizontal="left")
        c2.alignment = Alignment(horizontal="right")
        c3.alignment = Alignment(horizontal="right")
        c4.alignment = Alignment(horizontal="right")
        c4.font = bold_font
        
    # Auto-adjust summary sheet column widths
    for col in ws_dash.columns:
        max_len = max(len(str(cell.value or '')) for cell in col)
        col_letter = get_column_letter(col[0].column)
        ws_dash.column_dimensions[col_letter].width = max(max_len + 4, 12)
        
    # ── Sheet 2: Test Case Details ─────────────────────────────────────────
    ws_details = wb.create_sheet(title="Test Cases Details")
    ws_details.views.sheetView[0].showGridLines = True
    
    detail_headers = ["Test ID", "Module", "Feature/Target", "Description", "Expected Result", "Status"]
    for col_idx, h in enumerate(detail_headers, start=1):
        cell = ws_details.cell(row=1, column=col_idx, value=h)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = border_all
        
    ws_details.row_dimensions[1].height = 28
    
    passed_fill = PatternFill(start_color="D1FAE5", end_color="D1FAE5", fill_type="solid") # light green
    passed_font = Font(name="Segoe UI", size=10, bold=True, color="065F46")
    
    failed_fill = PatternFill(start_color="FEE2E2", end_color="FEE2E2", fill_type="solid") # light red
    failed_font = Font(name="Segoe UI", size=10, bold=True, color="991B1B")
    
    for row_idx, tc in enumerate(test_cases, start=2):
        ws_details.cell(row=row_idx, column=1, value=tc["id"]).alignment = Alignment(horizontal="center")
        ws_details.cell(row=row_idx, column=2, value=tc["module"])
        ws_details.cell(row=row_idx, column=3, value=tc["feature"])
        ws_details.cell(row=row_idx, column=4, value=tc["description"])
        ws_details.cell(row=row_idx, column=5, value=tc["expected"])
        
        status_cell = ws_details.cell(row=row_idx, column=6, value=tc["status"])
        status_cell.alignment = Alignment(horizontal="center")
        
        if tc["status"] == "Passed":
            status_cell.fill = passed_fill
            status_cell.font = passed_font
        else:
            status_cell.fill = failed_fill
            status_cell.font = failed_font
            
        for col_idx in range(1, 7):
            c = ws_details.cell(row=row_idx, column=col_idx)
            if col_idx != 6:
                c.font = regular_font
            c.border = border_all
            c.alignment = Alignment(vertical="center", wrap_text=True if col_idx in [3, 4, 5] else False)
            
        ws_details.row_dimensions[row_idx].height = 24
        
    # Auto-adjust column widths for details
    column_widths = {
        "A": 12,  # Test ID
        "B": 22,  # Module
        "C": 30,  # Feature
        "D": 50,  # Description
        "E": 50,  # Expected Result
        "F": 14   # Status
    }
    for col_letter, width in column_widths.items():
        ws_details.column_dimensions[col_letter].width = width
        
    wb.save("test_analysis_report.xlsx")
    print("Report generated successfully as 'test_analysis_report.xlsx'")

if __name__ == "__main__":
    generate_excel_report()
