#My Ethernet IP at work "192.168.1.176"
#My wireless IP at work "192.168.1.162"
#At home "192.168.2.219"
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

#@bottle.route("/socket")
#def socketTest():
#   return bottle.template("socketTest.tpl")

try:
   print("Launching LAN server..")
   bottle.run(host="192.168.1.142", port=8080)
except:
   print("LAN server failed! Hosting local..")
   bottle.run(host="localhost", port=8080)
