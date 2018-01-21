#!/usr/bin/env python
'''
    This is an example server application, using the tornado handlers,
    that you can use to connect your HTML/Javascript dashboard code to
    your robot via NetworkTables.

    Run this application with python, then you can open your browser to
    http://localhost:8888/ to view the index.html page.
'''

import os
import platform
from os.path import abspath, dirname, exists, join
from optparse import OptionParser
import json 

import tornado.web
from tornado.ioloop import IOLoop

from networktables import NetworkTables
from pynetworktables2js import get_handlers, NonCachingStaticFileHandler

import logging
logger = logging.getLogger('dashboard')

log_datefmt = "%H:%M:%S"
log_format = "%(asctime)s:%(msecs)03d %(levelname)-8s: %(name)-20s: %(message)s"

def init_networktables(ipaddr):

    logger.info("Connecting to networktables at %s" % ipaddr)
    NetworkTables.initialize(server=ipaddr)
    logger.info("Networktables Initialized")


def can_ping(hostname):
    num_flag = "c"
    if platform.system().lower() == "windows":
        num_flag = "n"
    return os.system("ping -%s 1 %s" % (num_flag, hostname)) == 0

def find_roborio():
    possible_hosts = [
        "roborio-3223-frc.local",
        "roborio-3223-frc",
        "roborio-3223-frc.frc-robot.local",
        "roborio-3223-frc.frc-robot"
    ]
    for i in range(1, 10):
        possible_hosts.append("roborio-3223-frc-%s.local" % i)
    for host in possible_hosts:
        if can_ping(host):
            return host
    return possible_hosts[0]

def find_raspi():
    possible_hosts = [
        "marschmahlo.local",
        "marschmahlo",
    ]
    for host in possible_hosts:
        if can_ping(host):
            return host
    return possible_hosts[0]

if __name__ == '__main__':

    # Setup options here
    parser = OptionParser()

    parser.add_option('-p', '--port', default=8888,
                      help='Port to run web server on')

    parser.add_option('-v', '--verbose', default=False, action='store_true',
                      help='Enable verbose logging')

    parser.add_option('--robot', default="10.32.23.2",
                      help="Robot's IP address")

    parser.add_option('--raspi', default="10.32.23.6",
                      help="Raspberry PI's IP address")

    options, args = parser.parse_args()

    # Setup logging
    logging.basicConfig(datefmt=log_datefmt,
                        format=log_format,
                        level=logging.DEBUG if options.verbose else logging.INFO)

    # Setup NetworkTables
    if options.robot == "find_roborio":
        print ("Searching for roborio")
        options.robot = find_roborio()

    if options.raspi == "find_raspi":
        print ("Searching for raspberry pi")
        options.raspi = find_raspi()

    pi_url = options.raspi
    rio_url = options.robot 

    init_networktables(options.robot)

    # setup tornado application with static handler + networktables support
    www_dir = abspath(join(dirname(__file__), 'www'))
    index_html = join(www_dir, 'index.html')

    if not exists(www_dir):
        logger.error("Directory '%s' does not exist!" % www_dir)
        exit(1)

    if not exists(index_html):
        logger.warn("%s not found" % index_html)

    class PiUrlHandler(tornado.web.RequestHandler):
        def get(self):
            self.write(json.dumps({"pi": "http://" + pi_url, "rio": "http://" + rio_url}))

    app = tornado.web.Application(
        get_handlers() + [
            (r"/piurl", PiUrlHandler),
            (r"/()", NonCachingStaticFileHandler, {"path": index_html}),
            (r"/(.*)", NonCachingStaticFileHandler, {"path": www_dir})
        ]
    )

    # Start the app
    logger.info("Listening on http://localhost:%s/" % options.port)

    app.listen(options.port)
    IOLoop.current().start()
