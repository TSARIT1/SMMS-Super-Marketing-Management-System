with open('/var/www/tsarITPVTLTD/templates/footer.html', 'r') as f:
    content = f.read()
content = content.replace('<a href="#" class="footer-services">Industries</a>', '<a href="/Aerospace" class="footer-services">Industries</a>')
content = content.replace('<a href="#" class="footer-services">Services</a>', '<a href="/BPOservices" class="footer-services">Services</a>')
content = content.replace('<a href="#" class="footer-services">Careers</a>', '<a href="/jobPage" class="footer-services">Careers</a>')
content = content.replace('<a href="#" class="footer-services">Tenders</a>', '<a href="/contact" class="footer-services">Tenders</a>')
content = content.replace('<a href="#" class="footer-services">Vendors</a>', '<a href="/contact" class="footer-services">Vendors</a>')
with open('/var/www/tsarITPVTLTD/templates/footer.html', 'w') as f:
    f.write(content)

# for about.html
with open('/var/www/tsarITPVTLTD/templates/about.html', 'r') as f:
    content = f.read()
content = content.replace('href="#" class="our-link"', 'href="/insights" class="our-link"')
content = content.replace('href="#" class="case-learn-more"', 'href="/insights" class="case-learn-more"')
content = content.replace('href="#" class="learn-more"', 'href="/contact" class="learn-more"')
with open('/var/www/tsarITPVTLTD/templates/about.html', 'w') as f:
    f.write(content)

# for index.html
with open('/var/www/tsarITPVTLTD/templates/index.html', 'r') as f:
    content = f.read()
content = content.replace('href="/insights" class="learn-more-btn"', 'href="/Media" class="learn-more-btn"')
with open('/var/www/tsarITPVTLTD/templates/index.html', 'w') as f:
    f.write(content)

# for TermsUse.html
# with open('/var/www/tsarITPVTLTD/templates/TermsUse.html', 'r') as f:
#     content = f.read()
# content += '\n<p>Refunds will be processed within 5-7 working days and credited to the customer\'s bank account.</p>\n'
# with open('/var/www/tsarITPVTLTD/templates/TermsUse.html', 'w') as f:
#     f.write(content)

print("Fixes applied")