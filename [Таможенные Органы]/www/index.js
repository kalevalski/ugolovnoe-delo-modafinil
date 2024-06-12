//const { load } = require("../platforms/android/app/src/main/assets/www/cordova");

if (window.cordova && window.cordova.InAppBrowser) window.open = function (href, target) {
    cordova.InAppBrowser.open(href, target || '_blank', 'location=yes')
}

window.clearCookies = function () {
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}

window.getCookie = function (cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
}

window.setCookie = function (cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

window.clearConfig = function () {
    if (window.localStorage) {
        window.localStorage.clear();
    } else {
        window.clearCookies();
    }
}

window.getConfig = function (name) {
    name = 'Config_' + name;
    if (window.localStorage) {
        return window.localStorage.getItem(name);
    } else {
        var matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : null;
    }
}

window.setConfig = function (name, value) {
    name = 'Config_' + name;
    if (window.localStorage) {
        return window.localStorage.setItem(name, value);
    } else {
        document.cookie = name + "=" + encodeURIComponent(value);
    }
}

var loadLink = function (href, resolve, reject) {
    var el = document.createElement('link');
    el.setAttribute("rel", "stylesheet");
    el.setAttribute("href", href);
    document.getElementsByTagName("head")[0].appendChild(el);
}

var loadScript = function (src, resolve, reject) {
    if (!/^http/.test(src)) src = siteUrl + src;
    var el = document.createElement('script');
    el.setAttribute("type", "text/javascript");
    el.setAttribute("src", src);
    el.onload = resolve;
    el.onerror = reject;
    document.getElementsByTagName("head")[0].appendChild(el);
}

// Load

var siteUrl = 'https://web2.edata.customs.ru';
var ensureSiteUrl = function (url) {
    if (url && !/^http/.test(url)) url = siteUrl + url;
    return url;
}
var ensureVersion = function (version) {
    if (version.LoaderUrl.match(/(https?:\/\/.+?)\//)) {
        siteUrl = version.LoaderUrl.match(/(https?:\/\/.+?)\//)[1];
    }
    version.SiteUrl = siteUrl;
    version.AppUrl = ensureSiteUrl(version.AppUrl);
    version.ViewUrl = ensureSiteUrl(version.ViewUrl);
    version.BundleCssUrl = ensureSiteUrl(version.BundleCssUrl);
    version.BundleScriptsUrl = ensureSiteUrl(version.BundleScriptsUrl);
    version.BundlePersonalCabinetUrl = ensureSiteUrl(version.BundlePersonalCabinetUrl);
    version.CloudSignUrl = ensureSiteUrl(version.CloudSignUrl);
    version.LoaderUrl = ensureSiteUrl(version.LoaderUrl);
}

var createVersion = function (appUrl) {
    return {
        AppUrl: appUrl,
        ViewUrl: appUrl + 'App/Index',
        AppVersion: '2019-01-01-00-00-00',
        ConfigVersion: '2019-01-01-00-00-00',
        ContentVersion: '2019-01-01-00-00-00',
        BundleCssUrl: appUrl + 'Content/cssApp',
        BundleScriptsUrl: appUrl + 'Scripts/scripts',
        BundlePersonalCabinetUrl: appUrl + 'Scripts/personalCabinet',
        LoaderUrl: appUrl + 'App/Loader'
    }
}

var web1UrlApp = 'https://web1.edata.customs.ru/FtsPersonalCabinetWeb2017/App';
var web2UrlApp = 'https://web2.edata.customs.ru/FtsPersonalCabinetWeb2017/App';
var web3testUrlApp = 'https://web3.edata.customs.ru/Test/FtsPersonalCabinetWeb2017/App';
var web4UrlApp = 'https://web4.edata.customs.ru/FtsPersonalCabinetWeb2017/App';

var web1Version = createVersion('https://web1.edata.customs.ru/FtsPersonalCabinetWeb2017/');
var web2Version = createVersion('https://web2.edata.customs.ru/FtsPersonalCabinetWeb2017/');
var web2vpnVersion = createVersion('https://lk-web02/FtsPersonalCabinetWeb2017/');
var web3testVersion = createVersion('https://web3.edata.customs.ru/Test/FtsPersonalCabinetWeb2017/');
var localhostVersion = createVersion('http://localhost/FtsPersonalCabinetWeb2017/');
var badVersion = createVersion('/FtsPersonalCabinetWeb2017/');

var failSafeVersion = web2Version;

window.isApp = true;
window.isMobile = true;
try {
    window.version = web2Version;
    //window.version = JSON.parse(getConfig('Version'));
    ensureVersion(window.version);
    if (!window.version) throw 'No config';
} catch (e) {
    window.version = failSafeVersion;
}

var connectionLost = function () {
    document.getElementById('initLabel').innerText = 'Сервер недоступен, проверьте соединение с интернетом';
    setTimeout(function () {
        window.location.reload(false);
    }, 5000);
}

var loadUrl = function (url) {
    window.location = url;
}

var loadVersion = function (version) {
    ensureVersion(version);
    window.version = version;
    document.getElementById('initLabel').innerText = 'Загрузка версии...';
    document.getElementById('loaderUrl').innerText = version.AppUrl;
    loadLink(version.BundleCssUrl);
    loadScript(version.BundleScriptsUrl, function () {
        loadScript(version.BundlePersonalCabinetUrl, function () {
            angular.bootstrap(window.document.body, ['personalCabinetModule']);
        }, function (e) {
            if (version === failSafeVersion) {
                connectionLost();
            } else {
                loadVersion(failSafeVersion);
            }
        });
    }, function (e) {
        if (version === failSafeVersion) {
            connectionLost();
        } else {
            loadVersion(failSafeVersion);
        }
    });
}

var loadLoader = function (version) {
    ensureVersion(version);
    document.getElementById('initLabel').innerText = 'Загрузка версии...';
    document.getElementById('loaderUrl').innerText = version.AppUrl;
    loadScript(version.LoaderUrl, function () {
        setConfig('Version', JSON.stringify(version));
    }, function () {
        if (version === failSafeVersion) {
            connectionLost();
        } else {
            loadLoader(failSafeVersion);
        }
    });
}

var showSecret = function (value) {
    if (value == undefined) {
        return getConfig('showSecret') && getConfig('showSecret') != 'false' && getConfig('showSecret');
    } else {
        setConfig('showSecret', value);
    }
}

var hideShowSecret = function () {
    document.getElementById('secretInfo').style.display = showSecret() ? 'block' : 'none';
    document.getElementById('currentVersion').innerText = 'Current: ' + window.version.AppUrl;
}
hideShowSecret();

document.getElementById('layout').addEventListener('click', function () {
    document.getElementById('initLabel').style.opacity = 1;
    document.getElementById('appVersion').style.opacity = 1;
});

var showSecretCounter = 0;
document.getElementById('initLabel').addEventListener('click', function () {
    showSecretCounter += 1;
    if (showSecretCounter > 10) {
        showSecret(!showSecret())
        setTimeout(function () {
            window.location.reload(false);
        }, 100);
    }
});

var clearStorage = function () {
    window.clearCookies();
    window.clearConfig();
    setTimeout(function () {
        window.location.reload(false);
    }, 100);
};

// Load version

var delayedAutoLoad = function () {
    setTimeout(function () {
        if (showSecretCounter > 0) {
            showSecretCounter -= 1;
            delayedAutoLoad();
        } else if (!showSecret()) {
            //loadLoader(window.version)
            loadUrl(web2UrlApp);
        }
    }, 2000);
}

// Load loader
if (!showSecret()) {
    delayedAutoLoad();
}

window.fingerprintStatus = { isAvailable: false, hasEnrolledFingerprints: false };
window.fingerprintApi = null;

window.pushStatus = { isAvailable: false };
window.pushApi = null;

document.addEventListener("deviceready", function () {

    try {
        cordova.getAppVersion.getVersionNumber().then(function (version) {
            window.appVersion = version;
            document.getElementById('appVersion').innerText = 'Версия ' + version;
        });
    } catch (e) {
        window.appVersion = e;
        document.getElementById('appVersion').innerText = 'Версия ' + e;
    }

    if (window.FingerprintAuth) {
        window.FingerprintAuth.isAvailable(function (result) {
            // { isAvailable: false, isHardwareDetected:true, hasEnrolledFingerprints:false }
            window.fingerprintStatus = { isAvailable: result.isAvailable, hasEnrolledFingerprints: result.hasEnrolledFingerprints }
            window.fingerprintApi = {
                encrypt: function (key, value, title, resolve, reject) {
                    window.FingerprintAuth.encrypt({
                        clientId: "FtsEdataCustoms",
                        username: key,
                        password: value,
                        locale: "ru",
                        disableBackup: true,
                        dialogTitle: title
                    }, function (result) {
                        if (result.withFingerprint) {
                            if (resolve) resolve(result.token);
                        } else {
                            if (reject) reject('Не выбран отпечаток');
                        }
                    }, reject);
                },
                decrypt: function (key, value, title, resolve, reject) {
                    window.FingerprintAuth.decrypt({
                        clientId: "FtsEdataCustoms",
                        username: key,
                        token: value,
                        locale: "ru",
                        disableBackup: true,
                        dialogTitle: title
                    }, function (result) {
                        if (result.withFingerprint && result.password) {
                            if (resolve) resolve(result.password);
                        } else {
                            if (reject) reject('Не выбран отпечаток');
                        }
                    }, reject);
                }
            }
        }, function (error) {
            window.fingerprintStatus = { isAvailable: false };
        });
    } else if (window.Fingerprint) {
        window.Fingerprint.isAvailable(function (result) {
            window.fingerprintStatus = { isAvailable: true, hasEnrolledFingerprints: true }
            window.fingerprintApi = {
                encrypt: function (key, value, title, resolve, reject) {
                    window.Fingerprint.registerBiometricSecret({
                        title: title,
                        secret: value,
                        invalidateOnEnrollment: true,
                        disableBackup: true,
                    }, function (result) {
                        if (resolve) resolve('Ok');
                    }, reject);
                },
                decrypt: function (key, value, title, resolve, reject) {
                    window.Fingerprint.loadBiometricSecret({
                        title: title,
                        disableBackup: true,
                    }, function (secret) {
                        if (resolve) resolve(secret);
                    }, reject);
                }
            }
        }, function (error) {
            window.fingerprintStatus = { isAvailable: false };
        });
    }

    if (window.PushNotification) {

        const push = window.PushNotification.init({
            android: {},
            browser: {
                pushServiceURL: 'http://push.api.phonegap.com/v1/push'
            },
            ios: {
                alert: 'true',
                badge: true,
                sound: 'false'
            },
            windows: {}
        });

        push.on('registration', function (data) {
            window.pushStatus.isAvailable = true;
            window.pushStatus.registrationId = data.registrationId;
        });

        push.on('error', function (e) {
            window.pushStatus.error = e.message;
        });

        window.pushApi = {
            subscribe: function (topic, resolve, reject) {
                push.subscribe(topic, function () {
                    if (console && console.log) console.log('Subscribe ' + topic);
                    if (resolve) resolve();
                }, reject);
            },
            notification: function (handler) {
                push.on('notification', function (data) {
                    if (console && console.log) console.log('Notification ' + data.message);
                    if (console && console.log) console.log(data);
                    if (handler) handler(data);
                });
            }
        }

        //window.pushApi.subscribe('01972697693', function () {
        //    alert('sub01972697693')
        //});
        //window.pushApi.notification(function (data) {
        //    alert(data.message);
        //    // data.message,
        //    // data.title,
        //    // data.count,
        //    // data.sound,
        //    // data.image,
        //    // data.additionalData
        //});

        if (window.FileTransfer) {

            var fileTransferCodes = ['Неизвестная ошибка', 'Файл не найден', 'Неправиный адрес', 'Ошибка соединения', 'Отмена', 'Нет изменений']

            window.cordovaDownloadAndOpenFile = function (url, fileName, mime, resolve, reject, status) {
                if (!resolve) resolve = function () { }
                if (!reject) reject = alert;
                if (!status) status = function () { }
                try {
                    status('Скачивание файла...');
                    var fileTransfer = new FileTransfer();
                    if (!url.startsWith('http')) url = window.location.origin + url;
                    var sourceURL = encodeURI(url);
                    var destinationURL = cordova.file.dataDirectory + fileName;
                    fileTransfer.download(sourceURL, destinationURL,
                        function (entry) {
                            status('Открытие файла...');
                            cordova.plugins.fileOpener2.open(destinationURL, mime, {
                                success: resolve, error: function (err) {
                                    reject('Ошибка открытия файла "' + fileName + '": ' + (err.status == 9 ? ('Не найдено приложения для открытия файлов типа' + mime) : err.message))
                                }
                            });
                        },
                        function (error) {
                            reject('Ошибка получения файла "' + fileName + '": ' + (error.exception || error.message || fileTransferCodes[error.code] || error));
                        },
                        true);
                } catch (err) {
                    reject('Ошибка получения файла "' + fileName + '": ' + (err.exception || err.message || err));
                }
            }

            window.downloadTest = function () {
                cordovaDownloadAndOpenFile('https://edata.customs.ru/Standart.Ep.v3.pdf', 'test-pdf.pdf', 'application/pdf');
            }

            window.downloadTest2 = function () {
                cordovaDownloadAndOpenFile('https://edata.customs.ru/Standart.Ep.v3.pdf', 'test-pdf.pdf', 'application/pdf');
            }

        }

    }

}, false);
