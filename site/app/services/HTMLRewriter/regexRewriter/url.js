function convertRelToAbsUrl(originalUrl, baseUrl) {
  const isAbsolute =
    /^(https?|file|ftps?|mailto|javascript|data:image\/[^;]{2,9};):/i.test(
      originalUrl
    );
  if (isAbsolute) {
    return originalUrl;
  }

  const url = new URL(originalUrl, baseUrl);
  return url.href;
}

// Taken from:
// https://stackoverflow.com/questions/7544550/javascript-regex-to-change-all-relative-urls-to-absolute/7544757#7544757
// Patched a little bit

/**
 * convertAllRelativeToAbsoluteUrls
 *
 * https://stackoverflow.com/a/7544757/1983903
 *
 * @param  {String} html
 * @return {String} updated html
 */
export function convertAllRelativeToAbsoluteUrls(html, baseUrl) {
  var me = this,
    att = "[^-a-z0-9:._]",
    entityEnd = "(?:;|(?!\\d))",
    ents = {
      " ": "(?:\\s|&nbsp;?|&#0*32" + entityEnd + "|&#x0*20" + entityEnd + ")",
      "(": "(?:\\(|&#0*40" + entityEnd + "|&#x0*28" + entityEnd + ")",
      ")": "(?:\\)|&#0*41" + entityEnd + "|&#x0*29" + entityEnd + ")",
      ".": "(?:\\.|&#0*46" + entityEnd + "|&#x0*2e" + entityEnd + ")",
    },
    charMap = {},
    s = ents[" "] + "*", // short-hand for common use
    any = "(?:[^>\"']*(?:\"[^\"]*\"|'[^']*'))*?[^>]*",
    slashRE = null,
    dotRE = null;

  function ae(string) {
    var allCharsLowerCase = string.toLowerCase(),
      allCharsUpperCase = string.toUpperCase(),
      reRes = "",
      charLowerCase = null,
      charUpperCase = null,
      reSub = null,
      i = null;

    if (ents[string]) {
      return ents[string];
    }

    for (i = 0; i < string.length; i++) {
      charLowerCase = allCharsLowerCase.charAt(i);
      if (charMap[charLowerCase]) {
        reRes += charMap[charLowerCase];
        continue;
      }
      charUpperCase = allCharsUpperCase.charAt(i);
      reSub = [charLowerCase];
      reSub.push("&#0*" + charLowerCase.charCodeAt(0) + entityEnd);
      reSub.push(
        "&#x0*" + charLowerCase.charCodeAt(0).toString(16) + entityEnd
      );

      if (charLowerCase !== charUpperCase) {
        reSub.push("&#0*" + charUpperCase.charCodeAt(0) + entityEnd);
        reSub.push(
          "&#x0*" + charUpperCase.charCodeAt(0).toString(16) + entityEnd
        );
      }
      reSub = "(?:" + reSub.join("|") + ")";
      reRes += charMap[charLowerCase] = reSub;
    }
    return (ents[string] = reRes);
  }

  function by(match, group1, group2, group3) {
    return group1 + convertRelToAbsUrl(group2, baseUrl) + group3;
  }

  slashRE = new RegExp(ae("/"), "g");
  dotRE = new RegExp(ae("."), "g");

  function by2(match, group1, group2, group3) {
    group2 = group2.replace(slashRE, "/").replace(dotRE, ".");
    return group1 + convertRelToAbsUrl(group2, baseUrl) + group3;
  }

  function cr(selector, attribute, marker, delimiter, end) {
    var re1 = null,
      re2 = null,
      re3 = null;

    if (typeof selector === "string") {
      selector = new RegExp(selector, "gi");
    }

    attribute = att + attribute;
    marker = typeof marker === "string" ? marker : "\\s*=\\s*";
    delimiter = typeof delimiter === "string" ? delimiter : "";
    end = typeof end === "string" ? "?)(" + end : ")(";

    re1 = new RegExp(
      "(" + attribute + marker + '")([^"' + delimiter + "]+" + end + ")",
      "gi"
    );
    re2 = new RegExp(
      "(" + attribute + marker + "')([^'" + delimiter + "]+" + end + ")",
      "gi"
    );
    re3 = new RegExp(
      "(" +
        attribute +
        marker +
        ")([^\"'][^\\s>" +
        delimiter +
        "]*" +
        end +
        ")",
      "gi"
    );

    html = html.replace(selector, function (match) {
      return match.replace(re1, by).replace(re2, by).replace(re3, by);
    });
  }

  function cri(selector, attribute, front, flags, delimiter, end) {
    var re1 = null,
      re2 = null,
      at1 = null,
      at2 = null,
      at3 = null,
      handleAttr = null;

    if (typeof selector === "string") {
      selector = new RegExp(selector, "gi");
    }

    attribute = att + attribute;
    flags = typeof flags === "string" ? flags : "gi";
    re1 = new RegExp("(" + attribute + '\\s*=\\s*")([^"]*)', "gi");
    re2 = new RegExp("(" + attribute + "\\s*=\\s*')([^']+)", "gi");
    at1 = new RegExp("(" + front + ')([^"]+)(")', flags);
    at2 = new RegExp("(" + front + ")([^']+)(')", flags);

    if (typeof delimiter === "string") {
      end = typeof end === "string" ? end : "";
      at3 = new RegExp(
        "(" +
          front +
          ")([^\"'][^" +
          delimiter +
          "]*" +
          (end ? "?)(" + end + ")" : ")()"),
        flags
      );
      handleAttr = function (match, g1, g2) {
        return g1 + g2.replace(at1, by2).replace(at2, by2).replace(at3, by2);
      };
    } else {
      handleAttr = function (match, g1, g2) {
        return g1 + g2.replace(at1, by2).replace(at2, by2);
      };
    }
    html = html.replace(selector, function (match) {
      return match.replace(re1, handleAttr).replace(re2, handleAttr);
    });
  }

  cri(
    "<meta" +
      any +
      att +
      'http-equiv\\s*=\\s*(?:"' +
      ae("refresh") +
      '"' +
      any +
      ">|'" +
      ae("refresh") +
      "'" +
      any +
      ">|" +
      ae("refresh") +
      "(?:" +
      ae(" ") +
      any +
      ">|>))",
    "content",
    ae("url") + s + ae("=") + s,
    "i"
  );

  cr("<" + any + att + "href\\s*=" + any + ">", "href"); /* Linked elements */
  cr("<" + any + att + "src\\s*=" + any + ">", "src"); /* Embedded elements */

  cr(
    "<object" + any + att + "data\\s*=" + any + ">",
    "data"
  ); /* <object data= > */
  cr(
    "<applet" + any + att + "codebase\\s*=" + any + ">",
    "codebase"
  ); /* <applet codebase= > */

  /* <param name=movie value= >*/
  cr(
    "<param" +
      any +
      att +
      'name\\s*=\\s*(?:"' +
      ae("movie") +
      '"' +
      any +
      ">|'" +
      ae("movie") +
      "'" +
      any +
      ">|" +
      ae("movie") +
      "(?:" +
      ae(" ") +
      any +
      ">|>))",
    "value"
  );

  cr(
    /<style[^>]*>(?:[^"']*(?:"[^"]*"|'[^']*'))*?[^'"]*(?:<\/style|$)/gi,
    "url",
    "\\s*\\(\\s*",
    "",
    "\\s*\\)"
  ); /* <style> */
  cri(
    "<" + any + att + "style\\s*=" + any + ">",
    "style",
    ae("url") + s + ae("(") + s,
    0,
    s + ae(")"),
    ae(")")
  ); /*< style=" url(...) " > */

  return html;
}
