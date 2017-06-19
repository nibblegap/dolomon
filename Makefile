EXTRACTFILES=utilities/locales_files.txt
EN=themes/default/lib/Dolomon/I18N/en.po
FR=themes/default/lib/Dolomon/I18N/fr.po
XGETTEXT=carton exec local/bin/xgettext.pl
CARTON=carton exec
REAL_DOLOMON=script/dolomon
DOLOMON=script/mounter

locales:
	find lib themes/default/templates/ > $(EXTRACTFILES)
	$(XGETTEXT) -f $(EXTRACTFILES) -o $(EN) 2>/dev/null
	$(XGETTEXT) -f $(EXTRACTFILES) -o $(FR) 2>/dev/null

dev:
	$(CARTON) morbo $(DOLOMON) --listen http://0.0.0.0:3000 --watch lib/ --watch script/ --watch themes/ --watch dolomon.conf

devlog:
	multitail log/development.log

minion:
	$(CARTON) $(REAL_DOLOMON) minion worker -- -m development