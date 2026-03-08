"""
Extract text from the PDF guide
"""
import PyPDF2

pdf_path = 'Mf_Explore_ISIN.pdf'

print("=" * 70)
print("READING MF_EXPLORE_ISIN.PDF GUIDE")
print("=" * 70)

with open(pdf_path, 'rb') as file:
    pdf = PyPDF2.PdfReader(file)
    print(f"\nTotal pages: {len(pdf.pages)}")
    print("\n" + "=" * 70)
    
    for i, page in enumerate(pdf.pages):
        print(f"\n--- PAGE {i+1} ---")
        text = page.extract_text()
        print(text)
        print("\n" + "-" * 70)
