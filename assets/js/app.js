
$(document).ready(function() {
    $('[data-toggle="tooltip"]').tooltip();
});
var requestURL = $("#requestURL").val()
var requestMethod = "GET"
var requestPayload = CryptoJS.enc.Hex.stringify(CryptoJS.SHA256(""))
var regionName = $("#region").val(),
    serviceName = $("#service").val(),
    secretKey = $("#secretKey").val();
var canonicalURI = "/"
var queryString = ""
var date = amzDate()
$('#date').val(date);
var tmp = document.createElement('a');
if (requestURL.indexOf('http://') !== 0 && requestURL.indexOf('https://') !== 0)
requestURL=`https://${requestURL}`
tmp.href = requestURL;
var basicHeaders = {
    "Host": tmp.hostname,
    "x-amz-date": date,
    // "X-amz-content-sha256": requestPayload
}
if($('#add-x-amz-content-sha256-header').is(":checked")){
    basicHeaders = {
    "Host": tmp.hostname,
    "x-amz-date": date,
    "X-amz-content-sha256": requestPayload
}
}
var formattedHeaders = formatHeaders(basicHeaders);
var CR = requestMethod + "\n" + canonicalURI + "\n" + queryString + "\n" + formattedHeaders.canonicalHeaders + "\n" +
    formattedHeaders.signedHeaders + "\n" + requestPayload
var credentialScope = date.split('T')[0] + "/" + regionName + "/" + serviceName + "/aws4_request"
var hashedCanocialRequest = CryptoJS.enc.Hex.stringify(CryptoJS.SHA256(CR))
var STS = "AWS4-HMAC-SHA256" + "\n" + date + "\n" + credentialScope + "\n" + hashedCanocialRequest
var hashedSTS = CryptoJS.enc.Hex.stringify(CryptoJS.SHA256(STS))
var kDate = CryptoJS.HmacSHA256(date.split('T')[0], "AWS4" + secretKey);
$("#kDate").val(CryptoJS.enc.Hex.stringify(kDate));
var kRegion = CryptoJS.HmacSHA256(regionName, kDate);
$("#kRegion").val(CryptoJS.enc.Hex.stringify(kRegion))
var kService = CryptoJS.HmacSHA256(serviceName, kRegion);
$("#kService").val(CryptoJS.enc.Hex.stringify(kService))
var kSigning = CryptoJS.HmacSHA256("aws4_request", kService);
$("#kSigning").val(CryptoJS.enc.Hex.stringify(kSigning))
var signature = CryptoJS.HmacSHA256(STS, kSigning)
$("#signature").val(CryptoJS.enc.Hex.stringify(signature))
var accessKey=$("#accessKey").val();
$("#auth-header").val("Authorization: AWS4-HMAC-SHA256 Credential="+accessKey+"/"+credentialScope+", SignedHeaders="+formattedHeaders.signedHeaders+", Signature="+CryptoJS.enc.Hex.stringify(signature))
$("#changeCRBtn").click(calculateSigv4Automatically);
$("#ChangeDate").click(function() {
    date = amzDate();
    $('#date').val(date);
    calculateSigv4Automatically();
})

calculateSigv4Automatically()

function calculateSigv4Automatically() {
    requestURL = $("#requestURL").val()
    date = $('#date').val()
    requestMethod = $("#requestMethod").val()
    requestPayload = CryptoJS.enc.Hex.stringify(CryptoJS.SHA256($("#requestBody").val()))
    regionName = $("#region").val()
    serviceName = $("#service").val()
    secretKey = $("#secretKey").val();
    accessKey=$("#accessKey").val();
    if (requestURL.indexOf('http://') !== 0 && requestURL.indexOf('https://') !== 0)
	requestURL=`https://${requestURL}`
    tmp.href = requestURL
    $('#date').val(date);
    $("#cr-requestmethod").val(requestMethod);
    canonicalURI = tmp.pathname.split('/').map(function(piece) {
        return encodeURIComponent(decodeURIComponent(piece))
    }).join('/')
    if (tmp.search.split('?')[1]) {
        var qs = tmp.search.split('?')[1]

        queryString = tmp.search.split('?')[1].split('&').map(function(data) {
            let enocodedQueryParameter = encodeURIComponent(decodeURIComponent(data.split('=')[0]))
            let encodedValue = encodeURIComponent(decodeURIComponent(data.split('=')[1]))
            if (!encodedValue || encodedValue == "undefined")
                encodedValue = ""
            return enocodedQueryParameter + "=" + encodedValue
        })
        queryString = queryString.sort(
            function(a, b) {
                if (a.split('=')[0] < b.split('=')[0]) return -1;
                if (a.split('=')[0] > b.split('=')[0]) return 1;
                return 0;
            }
        );

        queryString = valueOrderQueryString(queryString);
    } else {
        queryString = ""
    }

    $("#cr-canonicaluri").val(canonicalURI);
    $("#cr-canonicalqs").val(queryString);
    basicHeaders = {
        "Host": tmp.hostname,
        "x-amz-date": date,
        // "X-amz-content-sha256": requestPayload
    }
    if($('#add-x-amz-content-sha256-header').is(":checked")){
        basicHeaders = {
        "Host": tmp.hostname,
        "x-amz-date": date,
        "X-amz-content-sha256": requestPayload
    }
    }
    var customheaders=createCustomHeaders();
    try {
        formattedHeaders = formatHeaders(_.extend(basicHeaders, customheaders));
    } catch (e) {
        if ($("#requestHeaders").val() == "")
            formattedHeaders = formatHeaders(basicHeaders);
        else
            formattedHeaders = {
                canonicalHeaders: "Headers must be passed in JSON format",
                signedHeaders: "Headers must be passed in JSON format"
            }
    }
    $("#cr-canonicalheaders").val(formattedHeaders.canonicalHeaders)
    $("#cr-signedheaders").val(formattedHeaders.signedHeaders)
    $("#cr-requestpayload").val(requestPayload)
    CR = requestMethod + "\n" + canonicalURI + "\n" + queryString + "\n" + formattedHeaders.canonicalHeaders + "\n" +
        formattedHeaders.signedHeaders + "\n" + requestPayload
    $("#cr-cr").val(CR)
    hashedCanocialRequest = CryptoJS.enc.Hex.stringify(CryptoJS.SHA256(CR))
    credentialScope = date.split('T')[0] + "/" + regionName + "/" + serviceName + "/aws4_request"
    $("#sts-requestdatetime").val(date);
    $("#sts-credentialscope").val(credentialScope)
    $("#sts-hashedcr").val(hashedCanocialRequest)
    $("#cr-sts-hashedcr").val(hashedCanocialRequest)
    STS = "AWS4-HMAC-SHA256" + "\n" + date + "\n" + credentialScope + "\n" + hashedCanocialRequest
    $("#sts-sts").val(STS);
    hashedSTS = CryptoJS.enc.Hex.stringify(CryptoJS.SHA256(STS))
    $("#sts-hashedsts").val(hashedSTS)
    $("#kSecret").val(secretKey);
    kDate = CryptoJS.HmacSHA256(date.split('T')[0], "AWS4" + secretKey);
    $("#kDate").val(CryptoJS.enc.Hex.stringify(kDate));
    kRegion = CryptoJS.HmacSHA256(regionName, kDate);
    $("#kRegion").val(CryptoJS.enc.Hex.stringify(kRegion))
    kService = CryptoJS.HmacSHA256(serviceName, kRegion);
    $("#kService").val(CryptoJS.enc.Hex.stringify(kService))
    kSigning = CryptoJS.HmacSHA256("aws4_request", kService);
    $("#kSigning").val(CryptoJS.enc.Hex.stringify(kSigning))
    signature = CryptoJS.HmacSHA256(STS, kSigning)
    $("#signature").val(CryptoJS.enc.Hex.stringify(signature))

    $("#signature").val(CryptoJS.enc.Hex.stringify(signature))
$("#auth-header").val("Authorization: AWS4-HMAC-SHA256 Credential="+accessKey+"/"+credentialScope+", SignedHeaders="+formattedHeaders.signedHeaders+", Signature="+CryptoJS.enc.Hex.stringify(signature))
$("#curl-command").val("curl -X "+requestMethod+" '"+requestURL+"' "+printCURLHeaders(formattedHeaders.canonicalHeaders)+' -H "'+$("#auth-header").val()+'" '+($("#requestBody").val()?'--data "'+$("#requestBody").val()+'"':""))


}

function printCURLHeaders(headers){
    var res="";
    headers.split("\n").forEach(function(header){
        res+=' -H "'+header+'"';
    });
    return res;
}

function valueOrderQueryString(qsArr){
var result='';
var previousParam=null;
var obj={}

qsArr.forEach(function(data){
    let value=data.split('=');
    previousParam=value[0]
    if(obj[previousParam]){
        obj[previousParam].push(value[1]);
    }else{
        obj[previousParam]=[value[1]];
    }
})

    Object.keys(obj).forEach(function(key){
        obj[key]=obj[key].sort();
        obj[key].forEach(function(a){
           result+=(key+'='+a+'&');
        })
    })
    return result.substring(0,result.length-1)
}

function createCustomHeaders(){
 var headers={};
 arr=$("#requestHeaders").val().split('\n');
 var previousHeaderKey=null;
 arr.forEach(function(data){

    let value=data.split(':');
    if(value[1]){
        previousHeaderKey=value[0];
        if(headers[previousHeaderKey])
        headers[previousHeaderKey]+=(','+value[1].trim().replace(/\s\s+/g, ' '));
        else
        headers[previousHeaderKey]=value[1].trim().replace(/\s\s+/g, ' ');
    } else if(!previousHeaderKey) {
        return "First line is not properly formatted";
    } else {
        headers[previousHeaderKey]+=(","+value[0].trim().replace(/\s\s+/g, ' '));
    }
    
 });
 return headers;
}

function amzDate() {
    let date = new Date();
    let year = date.getUTCFullYear(),
        month = date.getUTCMonth(),
        day = date.getUTCDate(),
        hours = date.getUTCHours(),
        min = date.getUTCMinutes(),
        sec = date.getUTCSeconds()
    month++;
    month = month < 10 ? "0" + month : month
    day = day < 10 ? "0" + day : day
    hours = hours < 10 ? "0" + hours : hours
    min = min < 10 ? "0" + min : min
    sec = sec < 10 ? "0" + sec : sec

    date = year + "" + month + "" + day + "T" + hours + "" + min + "" + sec + "Z"
    return date;
}

function formatHeaders(headers) {
    var keys = Object.keys(headers),
        i, len = keys.length,
        canonicalHeaders = "",
        signedHeaders = "";

    keys = keys.sort(
        function(a, b) {
            if (a.toLowerCase() < b.toLowerCase()) return -1;
            if (a.toLowerCase() > b.toLowerCase()) return 1;
            return 0;
        }
    );

    for (i = 0; i < len; i++) {
        k = keys[i];
        //   sortedHeaders.push({k  : headers[k]});
        canonicalHeaders += k.toLowerCase();
        canonicalHeaders += ":"
        canonicalHeaders += headers[k].trim();
        canonicalHeaders += "\n"
        signedHeaders += k.toLowerCase();
        if (i != (len - 1))
            signedHeaders += ";";
    }
    return {
        signedHeaders: signedHeaders,
        canonicalHeaders: canonicalHeaders
    }

}

//add modal value
$(document).on("click", "span.glyphicon.glyphicon-info-sign", function() {
    var key = $(this).parent().text().trim()
    $("#myModal .modal-title").text(key);
    $("#myModal .modal-body p").html(modalData[key])

})

var modalData = {};

$.ajax({
  dataType: "json",
  url: 'modalData.json',
  success: function(data){
modalData=data;
  }
});