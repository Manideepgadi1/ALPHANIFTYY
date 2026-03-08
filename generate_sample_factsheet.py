"""
Sample Factsheet PDF Generator
Generates a professional-looking mutual fund factsheet PDF locally
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from datetime import datetime
import requests

def create_sample_factsheet(output_filename="sample_factsheet.pdf"):
    """
    Creates a sample factsheet PDF using real data from the API
    """
    
    # Fetch real data from deployed API
    try:
        print("Fetching fund data from API...")
        fund_response = requests.get("http://82.25.105.18/alphanifty/api/funds/5184", timeout=10)
        fund_data = fund_response.json()
        
        factsheet_response = requests.get("http://82.25.105.18/alphanifty/api/funds/5184/factsheet", timeout=10)
        factsheet_data = factsheet_response.json()
        
        print("✓ Data fetched successfully")
    except Exception as e:
        print(f"Error fetching data: {e}")
        print("Using sample data instead...")
        # Fallback sample data
        fund_data = {
            "scheme_name": "Aditya Birla Sun Life Banking & PSU Debt Fund - Direct Growth",
            "nav": "328.45",
            "return_1y": "7.89",
            "return_3y": "6.54",
            "return_5y": "7.12",
            "risk_category": "Moderately Low",
            "fund_house": "Aditya Birla Sun Life Mutual Fund"
        }
        factsheet_data = {
            "holdings": [
                {"name": "7.26 Govt Stock 2033", "percentage": 8.45},
                {"name": "HDFC Bank Limited", "percentage": 7.23},
                {"name": "State Bank of India", "percentage": 6.89},
                {"name": "ICICI Bank Limited", "percentage": 5.67},
                {"name": "Power Finance Corporation", "percentage": 4.23}
            ],
            "asset_allocation": {
                "debt": 95.97,
                "cash": 4.03
            },
            "credit_rating": {
                "AAA": 67.91,
                "AA+": 15.23,
                "A": 8.45,
                "Others": 8.41
            }
        }
    
    # Create PDF
    doc = SimpleDocTemplate(output_filename, pagesize=A4, 
                           topMargin=0.5*inch, bottomMargin=0.5*inch,
                           leftMargin=0.5*inch, rightMargin=0.5*inch)
    
    elements = []
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=16,
        textColor=colors.HexColor('#1a237e'),
        spaceAfter=6,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    header_style = ParagraphStyle(
        'CustomHeader',
        parent=styles['Heading2'],
        fontSize=12,
        textColor=colors.HexColor('#1a237e'),
        spaceAfter=8,
        spaceBefore=12,
        fontName='Helvetica-Bold'
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=9,
        leading=12
    )
    
    # Header with branding
    header_data = [
        [Paragraph("<b>VSFintech - AlphaNifty</b>", styles['Normal']), 
         Paragraph(f"<b>Fund Factsheet</b>", title_style),
         Paragraph(f"As on {datetime.now().strftime('%d %B %Y')}", styles['Normal'])]
    ]
    header_table = Table(header_data, colWidths=[2*inch, 3.5*inch, 2*inch])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ALIGN', (0, 0), (0, 0), 'LEFT'),
        ('ALIGN', (1, 0), (1, 0), 'CENTER'),
        ('ALIGN', (2, 0), (2, 0), 'RIGHT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
    ]))
    elements.append(header_table)
    
    # Blue header line
    line_data = [['']]
    line_table = Table(line_data, colWidths=[7.5*inch], rowHeights=[3])
    line_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#1a237e')),
    ]))
    elements.append(line_table)
    elements.append(Spacer(1, 0.15*inch))
    
    # Fund Name
    fund_name = fund_data.get('scheme_name', 'N/A')
    elements.append(Paragraph(f"<b>{fund_name}</b>", header_style))
    elements.append(Spacer(1, 0.1*inch))
    
    # Key Metrics Table
    nav = fund_data.get('nav', 'N/A')
    risk = fund_data.get('risk_category', 'N/A')
    
    metrics_data = [
        [Paragraph('<b>Net Asset Value (NAV)</b>', normal_style), 
         Paragraph(f'₹ {nav}', normal_style),
         Paragraph('<b>Risk Category</b>', normal_style), 
         Paragraph(risk, normal_style)],
    ]
    
    metrics_table = Table(metrics_data, colWidths=[1.8*inch, 1.8*inch, 1.8*inch, 2*inch])
    metrics_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e3f2fd')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(metrics_table)
    elements.append(Spacer(1, 0.15*inch))
    
    # Returns Table
    elements.append(Paragraph("<b>Historical Returns (%)</b>", header_style))
    returns_data = [
        ['<b>1 Year</b>', '<b>3 Years</b>', '<b>5 Years</b>'],
        [fund_data.get('return_1y', 'N/A'), 
         fund_data.get('return_3y', 'N/A'), 
         fund_data.get('return_5y', 'N/A')]
    ]
    
    returns_table = Table(returns_data, colWidths=[2.5*inch, 2.5*inch, 2.5*inch])
    returns_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a237e')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f5f5f5')),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('PADDING', (0, 0), (-1, -1), 10),
    ]))
    elements.append(returns_table)
    elements.append(Spacer(1, 0.15*inch))
    
    # Top Holdings
    elements.append(Paragraph("<b>Top Holdings</b>", header_style))
    holdings = factsheet_data.get('holdings', [])[:10]  # Top 10
    
    holdings_data = [['<b>Security Name</b>', '<b>% of Portfolio</b>']]
    for holding in holdings:
        holdings_data.append([
            holding.get('name', 'N/A'),
            f"{holding.get('percentage', 0):.2f}%"
        ])
    
    holdings_table = Table(holdings_data, colWidths=[5.5*inch, 2*inch])
    holdings_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a237e')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9f9f9')]),
    ]))
    elements.append(holdings_table)
    elements.append(Spacer(1, 0.15*inch))
    
    # Asset Allocation
    elements.append(Paragraph("<b>Asset Allocation</b>", header_style))
    asset_alloc = factsheet_data.get('asset_allocation', {})
    
    alloc_data = [['<b>Asset Class</b>', '<b>Allocation %</b>']]
    for asset, percentage in asset_alloc.items():
        alloc_data.append([asset.capitalize(), f"{percentage:.2f}%"])
    
    alloc_table = Table(alloc_data, colWidths=[3.75*inch, 3.75*inch])
    alloc_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a237e')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f5f5f5')),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('ALIGN', (1, 0), (1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(alloc_table)
    elements.append(Spacer(1, 0.15*inch))
    
    # Credit Rating (if available)
    credit_rating = factsheet_data.get('credit_rating', {})
    if credit_rating:
        elements.append(Paragraph("<b>Credit Rating Profile</b>", header_style))
        rating_data = [['<b>Rating</b>', '<b>% of Debt</b>']]
        for rating, percentage in credit_rating.items():
            rating_data.append([rating, f"{percentage:.2f}%"])
        
        rating_table = Table(rating_data, colWidths=[3.75*inch, 3.75*inch])
        rating_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a237e')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f5f5f5')),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ('ALIGN', (1, 0), (1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('PADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(rating_table)
        elements.append(Spacer(1, 0.1*inch))
    
    # Footer disclaimer
    elements.append(Spacer(1, 0.2*inch))
    disclaimer = """
    <i><font size=7>
    <b>Disclaimer:</b> This factsheet is for informational purposes only. Past performance is not indicative of future results. 
    Mutual fund investments are subject to market risks. Please read the scheme information document carefully before investing. 
    Generated by VSFintech AlphaNifty Platform.
    </font></i>
    """
    elements.append(Paragraph(disclaimer, normal_style))
    
    # Build PDF
    print(f"Generating PDF: {output_filename}...")
    doc.build(elements)
    print(f"✓ PDF generated successfully: {output_filename}")
    return output_filename


if __name__ == "__main__":
    print("\n" + "="*60)
    print("VSFintech - Sample Factsheet Generator")
    print("="*60 + "\n")
    
    try:
        pdf_file = create_sample_factsheet()
        print(f"\n✓ Sample factsheet created: {pdf_file}")
        print("\nOpen the PDF to see how factsheets will look!")
        
        # Try to open the PDF automatically
        import os
        import platform
        if platform.system() == 'Windows':
            os.startfile(pdf_file)
        elif platform.system() == 'Darwin':  # macOS
            os.system(f'open "{pdf_file}"')
        else:  # Linux
            os.system(f'xdg-open "{pdf_file}"')
            
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
