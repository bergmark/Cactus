var B = Cactus.Web.Browser;
var stringify = Cactus.Util.JSON.stringify;

var samples = {
  "chrome 10.0 osx" : {
    "language" : "en-US",
    "product" : "Gecko"
  },
  "chrome 10.0 win" : {
    "language" : "sv",
    "product" : "Gecko"
  },
  "ie 8.0 win" : {
    "appCodeName" : "Mozilla",
    "appName" : "Microsoft Internet Explorer",
    "appMinorVersion" : "0",
    "cpuClass" : "x86",
    "platform" : "Win32"
  },
  "ie 7.0 win" : {
    "appCodeName" : "Mozilla",
    "appName" : "Microsoft Internet Explorer",
    "appMinorVersion" : "0",
    "cpuClass" : "x86",
    "platform" : "Win32",
    "plugins" : [],
    "opsProfile" : null,
    "userProfile" : null,
    "systemLanguage" : "en-us",
    "userLanguage" : "en-us",
    "appVersion" : "4.0 (compatible; MSIE 7.0; Windows NT 5.1)",
    "userAgent" : "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1)",
    "onLine" : true,
    "cookieEnabled" : true,
    "mimeTypes" : []
  },
  "ie 6.0 win" : {
    "appCodeName" : "Mozilla",
    "appName" : "Microsoft Internet Explorer",
    "appMinorVersion" : "0",
    "cpuClass" : "x86",
    "platform" : "Win32",
    "plugins" : [],
    "opsProfile" : undefined,
    "userProfile" : undefined,
    "systemLanguage" : "en-us",
    "userLanguage" : "en-us",
    "appVersion" : "4.0 (compatible; MSIE 6.0; Windows NT 5.1)",
    "userAgent" : "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)",
    "onLine" : true,
    "cookieEnabled" : true,
    "mimeTypes" : []
  },
  "opera 11.01 osx" : {
    "appCodeName" : "Mozilla",
    "appMinorVersion" : "",
    "appName" : "Opera",
    "appVersion" : "9.80 (Macintosh; Intel Mac OS X 10.6.6; U; Mac App Store Edition; en)",
    "browserLanguage" : "en",
    "cookieEnabled" : true,
    "geolocation" : {"lastPosition":null},
    "language" : "en"
  },
  "opera 11.01 win" : {
    "appCodeName" : "Mozilla",
    "appMinorVersion" : "",
    "appName" : "Opera",
    "appVersion" : "9.80 (Windows NT 5.1; U; en)",
    "browserLanguage" : "en",
    "cookieEnabled" : true,
    "geolocation" : {"lastPosition":null},
    "language" : "en"
  },
  "safari 5.0.3 os x" : {
    "geolocation" : {},
    "cookieEnabled" : true,
    "language" : "en-us",
    "productSub" : "20030107",
    "product" : "Gecko",
    "appCodeName" : "Mozilla"
  },
  "safari 5.0.4 win" : {
    "geolocation" : {},
    "cookieEnabled" : true,
    "language" : "en-US",
    "productSub" : "20030107",
    "product" : "Gecko",
    "appCodeName" : "Mozilla"
  },
  "ff 4.0 osx" : {
    "constructor" : {},
    "userAgent" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.6; rv:2.0) Gecko/20100101 Firefox/4.0",
    "appVersion" : "5.0 (Macintosh)",
    "appCodeName" : "Mozilla",
    "appName" : "Netscape",
    "language" : "en-US",
    "mimeTypes" : [{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],
    "platform" : "MacIntel",
    "oscpu" : "Intel Mac OS X 10.6",
    "vendor" : "",
    "vendorSub" : "",
    "product" : "Gecko",
    "productSub" : "20100101",
    "plugins" : [[{}],[{}],[{},{},{},{},{},{},{}],[{},{},{},{},{},{},{}],[{},{},{},{},{},{},{},{}],[{},{},{},{}],[{},{},{},{},{},{},{},{},{},{}],[{},{},{},{},{},{},{},{},{}],[{},{},{},{},{},{}],[{}],[{}],[{},{}],[{}],[{}],[{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],[{},{}],[{},{},{},{},{},{},{}],[{}],[{},{},{},{},{},{},{},{},{}],[{}]],
    "securityPolicy" : "",
    "cookieEnabled" : true,
    "onLine" : true,
    "buildID" : "20110318052756",
    "javaEnabled" : undefined,
    "taintEnabled" : undefined,
    "geolocation" : {},
    "registerContentHandler" : undefined,
    "registerProtocolHandler" : undefined,
    "mozIsLocallyAvailable" : undefined,
  },
  "ff 4.0 win" : {
    "userAgent" : "Mozilla/5.0 (Windows NT 5.1; rv:2.0) Gecko/20100101 Firefox/4.0",
    "appVersion" : "5.0 (Windows)",
    "appCodeName" : "Mozilla",
    "appName" : "Netscape",
    "language" : "en-US",
    "mimeTypes" : [{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],
    "platform" : "Win32",
    "oscpu" : "Windows NT 5.1",
    "vendor" : "",
    "vendorSub" : "",
    "product" : "Gecko",
    "productSub" : "20100101",
    "plugins" : [[{}],[{}],[{},{},{},{},{},{},{}],[{},{},{},{},{},{},{}],[{},{},{},{},{},{},{},{}],[{},{},{},{}],[{},{},{},{},{},{},{},{},{},{}],[{},{},{},{},{},{},{},{},{}],[{},{},{},{},{},{}],[{}],[{}],[{},{}],[{}],[{}],[{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],[{},{}],[{},{},{},{},{},{},{}],[{}],[{},{},{},{},{},{},{},{},{}],[{}]],
    "securityPolicy" : "",
    "cookieEnabled" : true,
    "onLine" : true,
    "buildID" : "20110318052756",
    "javaEnabled" : undefined,
    "taintEnabled" : undefined,
    "geolocation" : {},
    "registerContentHandler" : undefined,
    "registerProtocolHandler" : undefined,
    "mozIsLocallyAvailable" : undefined
  }
};


document.write("<h2>Web.Browser contents</h2>");
document.write("<ul>");
for (var p in B) if (B.hasOwnProperty(p)) {
  document.write("<li>" + p + " = " + stringify(B[p]) + "</li>");
}
document.write("</ul>");

document.write("<h2>navigator data</h2>");
document.write("<ul>");
for (p in navigator) {
  var s = navigator[p];
  try {
    s = stringify(navigator[p]);
  } catch (e) {
    // .
  }
  document.write("<li>" + p + " = " + s + "</li>");
}
document.write("</ul>");
