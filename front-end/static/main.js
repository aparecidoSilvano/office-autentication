var app = angular.module('DemoApp', ['ui.router', 'satellizer']);

app.config(function ($stateProvider, $urlRouterProvider, $authProvider) {
    $stateProvider
        .state('home', {
            url: '/home',
            templateUrl: '../partials/home.tpl.html'
        })
        .state('secret', {
            url: '/secret',
            templateUrl: '../partials/secret.tpl.html',
            controller: 'SecretCtr',
            data: {requireLogin: true}
        })
        .state('login', {
            url: '/login',
            templateUrl: '../partials/login.tpl.html',
            controller: 'LoginCtr'
        });
    $urlRouterProvider.otherwise('/home');

    $authProvider.live({
        authorizationEndpoint: 'https://login.microsoftonline.com/common',
        clientId: '0de6756b-a91c-4ad5-a542-c6ae3f22c5a9'
    });

});

// para verificar se o cara tá logado
app.run(function ($rootScope, $state, $auth) {
    $rootScope.$on('$stateChangeStart',
        function (event, toState) {
            var requiredLogin = false;
            // check if this state need login
            if (toState.data && toState.data.requiredLogin) {
                requiredLogin = true;
            }

            // if yes and if this user is not logged in, redirect him to login page
            if (requiredLogin && !$auth.isAuthenticated()) {
                event.preventDefault();
                $state.go('login');
            }
        });
});

app.controller('SecretCtr', function ($scope, $state, $auth) {
    console.log('No SecretCtr');
});

app.controller('LoginCtr', function ($scope, $state, $auth, $window, $q, $http, $timeout) {
    console.log('No LoginCtr');
    $scope.authenticate = function () {
        console.log('Entrou no authenticate');
        //$auth.authenticate(provider);
        $http({
            method: 'GET',
            url: 'http://localhost:8080/',
            //consigo dzer para o servidor quem é o client.
            params: {client: 'CLIENT_WEB'}
        }).then(function successCallback(response) {
            console.log('sucesso pra chamar o servidor');
            $timeout(function () {
                office365Auth($window, $q, response.data.url);
            });

        }, function errorCallback(response) {
            console.log('error pra chamar o servidor');
        });
    }
});

var urlBuilder = [];
var clientId = 'fd4f1e86-7cb0-4ac4-9600-a0e331f0ee06';
urlBuilder.push('client_id=' + clientId,
    'redirect_uri=' + window.location.origin,
    'response_type=code');

var office365Auth = function ($window, $q, url) {
    /*var url = 'https://login.microsoftonline.com/fd4f1e86-7cb0-4ac4-9600-a0e331f0ee06/oauth2/authorize?'
     + urlBuilder.join('&');*/
    var options = "width=500, height=500, left=" + ($window.outerWidth - 500) / 2 + ",top=" + ($window.outerHeight - 500) / 2.5;
    var deferred = $q.defer();
    var popup = $window.open(url, '_blank', options);
    $window.focus();

    $window.addEventListener('message', function (event) {
        console.log('Entrou no eventListner, COM CLOSE');
    }, true);

    // captura quando a janela fecha.
    var pollTimer = $window.setInterval(function() {
        if (popup.closed !== false) { // !== is required for compatibility with Opera
            $window.clearInterval(pollTimer);
            console.log('Fechou a janela!!!!!!!!!!!!!!!');
        }
    }, 200);

    $window.addEventListener('message', function (event) {
        console.log('Entrou no callback do addEventListner');
        if (event.origin === $window.location.origin) {
            var code = event.data;
            popup.close();
            console.log(code);
            $http.post(API_URL + 'auth/office365', {
                code: code,
                clientId: clientId,
                redirectUri: window.location.origin
            }).success(function (jwt) {
                authSuccessful(jwt);
                deferred.resolve(jwt);
            });
        }
    })

    return deferred.promise;
}

