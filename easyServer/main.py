import bottle.bottle as bottle

# Turn on debug
bottle.debug(True)
# Tell bottle where to look for templates
bottle.TEMPLATE_PATH.insert(0, "./res/templates")

@bottle.route("/")
def home():
   return bottle.template("home.tpl")

@bottle.route("/res/<folder>/<filename>", method="GET")
def getFile(folder, filename):
   return bottle.static_file(filename, root="./res/" + folder)
    

@bottle.route("/game")
def game():
   return bottle.template("game.tpl")

bottle.run(host="localhost", port=8080)
