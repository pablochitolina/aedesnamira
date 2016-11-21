app.controller('PrincipalCtrl', function (Cidades, $base64, $scope, $window, $location, $anchorScroll, $http, $routeParams) {

            var idservico = $routeParams.idservico;
            var cidadeParams = $routeParams.cidadeParams;

            $scope.cidadeChamados = '';

            $scope.mostraDesc = true;

            $scope.altMapTop = $window.innerHeight/2;

            var Cidades = Cidades.all();

            $scope.enviado = 'nao';
            loaded = true;
     
            setMapSize();
            $scope.mostraCidades = false;
            $scope.noservico = true;
            $scope.procurando = true;

            $scope.contNovo = 0;
            $scope.contAtend = 0;
            $scope.contRes = 0;
            

            $scope.filtraCidade = function(query){

                if(query.length >= 3){
                    $scope.mostraCidades = true;
                    $scope.cidades = JSON.search(Cidades, '//*[contains(Nome,"' + query + '")]');
                }else{
                    $scope.cidades = {};
                    $scope.mostraCidades = false;
                }
                
            }  

            

            //$window.addEventListener('resize', setMapSize);
            google.maps.event.addDomListener($window, 'resize', setMapSize);

            function setMapSize() {
              $scope.mapSize = document.getElementById('divmap').clientWidth;
            }
            $scope.getCidade = function(cidade){
                $scope.mostraCidades = false;
                loaded = false;
                $scope.cidadeChamados = ' em ' + cidade.Nome + ' / ' + cidade.Estado;
                $scope.getPontos(cidade.ID);
            }

        carregamapadesc = function (data) {

            var marker = new google.maps.Marker({});  
            
            $scope.mapdesc = new google.maps.Map(document.getElementById('mapdes'), {
            zoom: 17,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            //draggable: !("ontouchend" in document),
            scrollwheel: false
        });

                if (data && data.message === 'success') {

                    $scope.mapdesc.setCenter(new google.maps.LatLng(data.servico.lat, data.servico.lng));

                    var icon = {};
                    var status, cor;

                    switch (data.servico.status) {
                        case "novo":
                        status = "Novo";
                        cor = "#d62d20";
                        icon = {
                                    url: "img/pinred.png", // url
                                    scaledSize: new google.maps.Size(41, 68), // scaled size
                                    origin: new google.maps.Point(0, 0), // origin
                                    anchor: new google.maps.Point(20, 68) // anchor
                                };
                                break;
                                case "atendido":
                                status = "Atendido"
                                cor = "#ffa700";
                                icon = {
                                    url: "img/pinyellow.png", // url
                                    scaledSize: new google.maps.Size(41, 68), // scaled size
                                    origin: new google.maps.Point(0, 0), // origin
                                    anchor: new google.maps.Point(20, 68) // anchorr
                                };
                                break;
                                case "resolvido":
                                status = "Resolvido"
                                cor = "#008744";
                                icon = {
                                    url: "img/pingreen.png", // url
                                    scaledSize: new google.maps.Size(41, 68), // scaled size
                                    origin: new google.maps.Point(0, 0), // origin
                                    anchor: new google.maps.Point(20, 68) // anchor
                                };
                                break;
                                default:
                                icon = 'img/pinred.png';
                            }

                            var conteudo = '<div class="googft-info-window" style="line-height: 1.35; overflow: hidden; font-family: sans-serif;  height: 20em; overflow-y: auto;">' +
                            '<h2 style="color: ' + cor + '">' + status + '</h2> ' +
                            '<p><h3><em>' + data.servico.desc + '</em></h3></p>' +
                            '<p style="margin-bottom: 0;"><b>' + data.servico.data + '</b></p><p>' + data.servico.endereco + '</p>' +
                            '</div>';

                            $scope.imagem = '/api/imagem/' + data.servico.filename;
                            $scope.status = status
                            $scope.desc = data.servico.desc
                            $scope.endereco = data.servico.endereco;
                            $scope.cor = cor;

                            marker = new google.maps.Marker({
                                map: $scope.mapdesc,
                                icon: icon,
                                position: new google.maps.LatLng(data.servico.lat, data.servico.lng)
                            });

                            var infowindow = new google.maps.InfoWindow({
                                maxWidth: $window.innerWidth / 3
                            });

                            google.maps.event.addListener(marker, 'click', (function (marker, conteudo, infowindow) {
                                return function () {
                                    infowindow.setContent(conteudo);
                                    infowindow.open($scope.mapdesc, marker);
                                };
                            })(marker, conteudo, infowindow));

                        } else {

                            navigator.geolocation.getCurrentPosition(function (position) {
                                
                                $scope.mapdesc.setCenter(google.maps.LatLng(position.coords.latitude, position.coords.longitude));

                                $scope.mostraDesc = false;
                            });
                            
                        }

                    
                }

                carregamapa = function (cidade) {

                    $scope.map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 13,
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    //draggable: !("ontouchend" in document),
                    scrollwheel: false
                });

                    navigator.geolocation.getCurrentPosition(function (position) {
                        $scope.procurando = false;

                        if(cidade === undefined){
                            var geolocate = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                            geocodeLatLng(geolocate);
                        }else{
                            var cidadeDado = JSON.search(Cidades, '//*[ID="' + cidade + '"]');

                            $scope.cidadeChamados = ' em ' + cidadeDado[0].Nome + ' / ' + cidadeDado[0].Estado;
                            $scope.getPontos(cidade);
                        }
                        
                        
                    });

            }

            $scope.$on('$viewContentLoaded', function() {
                $scope.contNovo = 0;
            $scope.contAtend = 0;
            $scope.contRes = 0;
               cidadeParams = $routeParams.cidadeParams;
                $scope.procurando = true;
                loaded = true;
              
                if (!!navigator.geolocation) { 
                    
                    carregamapa(cidadeParams);
                       

                    if (idservico !== undefined) {

//console.log('idservico ' + idservico.length);

                        $http.get('/api/servico/' + idservico)
                        .success(function (data) {
                                //console.log("data: " + JSON.stringify(data));
                                carregamapadesc(data);
                                //carregamapa();
                            })
                        .error(function (data) {
                                //console.log("ERR: " + JSON.stringify(data));
                                $scope.mostraDesc = false;
                                //carregamapa();
                            });
                    } else {
                        $scope.mostraDesc = false;
                        //carregamapa();
                    }
                 } else {
                    $scope.mostraDesc = false;
                    document.getElementById('map').innerHTML = 'Sem suporte a Geolocalização.';

                }
    //call it here
            });

            $scope.scrollTo = function (id) {
                var old = $location.hash();
                $location.hash(id);
                $anchorScroll();
                //reset to old to keep any additional routing logic from kicking in
                $location.hash(old);
            };

            $scope.enviaMsg = function(valid){

                $scope.enviado = 'nao';
                if(valid){
                    $http.post('/api/postmessage/',{
                        name: $scope.data.nome,
                        email: $scope.data.email,
                        message: $scope.data.message})
                    .success(function (data) {
                        if(data.message === 'success'){
                            $scope.enviado = 'sim';
                        }else{
                            $scope.enviado = 'erro';
                        }
                    })
                    .error(function (data) {
                        $scope.enviado = 'erro';
                    });
                }else{
                    $scope.enviado = 'inv';
                }
            }

            function geocodeLatLng(latlng) {

                var geocoder = new google.maps.Geocoder();
                geocoder.geocode({ 'location': latlng }, function (results, status) {
                 
                  if (status === google.maps.GeocoderStatus.OK) {
                    if (results[1]) {
                      enderecoReversoCidade = 'nf';
                      enderecoReversoEstado = 'nf';

                      var arrAddress = results[0].address_components;

                      for (ac = 0; ac < arrAddress.length; ac++) {
                        if (arrAddress[ac].types[0] == "locality") {
                          enderecoReversoCidade = arrAddress[ac].long_name;
                      } 
                      if (arrAddress[ac].types[0] == "administrative_area_level_1") {
                          enderecoReversoEstado = arrAddress[ac].short_name;
                      } 
                  }

                  $scope.cidadeChamados = ' em ' + enderecoReversoCidade + ' / ' + enderecoReversoEstado;

                  //console.log("cidade " + enderecoReversoCidade);

                  var cidades = JSON.search(Cidades, '//*[Estado="' + enderecoReversoEstado + '"]');
                  //console.log("cidades: " + JSON.stringify(cidades));
                  
                  if (cidades.length > 0) {

                    var mun = JSON.search(cidades, '//*[contains(Nome,"' + enderecoReversoCidade + '")]');
                    //console.log("mun: " + JSON.stringify(mun));

                    if (mun.length == 1) {

                      $scope.getPontos(mun[0].ID);

                  } else{
                    $scope.getPontos(999999);
                  }
              }else{
                $scope.getPontos(999999);
              }
              
              } else {
                  console.log('Endereço não encontrado');
              }
              } else {
                console.log('Geocoder falhou por: ' + status);
            }
        });
            }

            $scope.getPontos = function (cidade) {

                $scope.contNovo = 0;
                $scope.contAtend = 0;
                $scope.contRes = 0;

                
                
                cidadeParams = cidade;

                $http.defaults.headers.common["Content-Type"] = 'application/json';
                $http.defaults.headers.common["cidade"] = cidade;

                $http.get('/api/servicolistlatlngcidade/')
                .success(function (data, status, headers, config) {
                    
                    if (data.message === 'success') {
                        $scope.noservico = false;

                            //console.log(JSON.stringify(data));
                            var geolocale;

                            angular.forEach(data.servicos, function (item) {
                     
                                //console.log(item);
                                var icon = {};
                                var status, cor;

                                switch (item.status) {
                                    case "novo":
                                    $scope.contNovo++;
                                    status = "Novo";
                                    cor = "#d62d20";
                                    icon = {
                                            url: "img/pinred.png", // url
                                            scaledSize: new google.maps.Size(21, 34), // scaled size
                                            origin: new google.maps.Point(0, 0), // origin
                                            anchor: new google.maps.Point(10, 34) // anchor
                                        };
                                        break;
                                        case "atendido":
                                        $scope.contAtend++;
                                        status = "Atendido"
                                        cor = "#ffa700";
                                        icon = {
                                            url: "img/pinyellow.png", // url
                                            scaledSize: new google.maps.Size(21, 34), // scaled size
                                            origin: new google.maps.Point(0, 0), // origin
                                            anchor: new google.maps.Point(10, 34) // anchor
                                        };
                                        break;
                                        case "resolvido":
                                        $scope.contRes++;
                                        status = "Resolvido"
                                        cor = "#008744";
                                        icon = {
                                            url: "img/pingreen.png", // url
                                            scaledSize: new google.maps.Size(21, 34), // scaled size
                                            origin: new google.maps.Point(0, 0), // origin
                                            anchor: new google.maps.Point(10, 34) // anchor
                                        };
                                        break;
                                        default:
                                        icon = 'img/pinred.png';
                                    }
                                    var conteudo = '<div class="googft-info-window" style="line-height: 1.35; overflow: hidden; font-family: sans-serif;  height: 20em; overflow-y: auto;">' +
                                    '<h2 style="color: ' + cor + '">' + status + '</h2> ' +
                                    '<p><h3><em>' + item.desc + '</em></h3></p>' +
                                    '<p style="margin-bottom: 0;"><b>' + item.data + '</b></p><p>' + item.endereco + '</p>' +
                                    '<a style="margin-bottom: 20px;" class="button" href="#/principal/'+ item._id+'/'+cidadeParams+'#desc">Foto</a>' +
                                    '</div>';

                                    var infowindow = new google.maps.InfoWindow({
                                        maxWidth: $window.innerWidth / 2
                                    });

                                    geolocale = new google.maps.LatLng(item.lat, item.lng);

                                    marker = new google.maps.Marker({
                                        map: $scope.map,
                                        icon: icon,
                                        position: new google.maps.LatLng(item.lat, item.lng)
                                    });

                                    google.maps.event.addListener(marker, 'click', (function (marker, conteudo, infowindow) {
                                        return function () {
                                            infowindow.setContent(conteudo);
                                            infowindow.open($scope.map, marker);
                                        };
                                    })(marker, conteudo, infowindow));

                                });
  
                                $scope.map.setCenter(geolocale);
               
                            

                            }else{

                            $scope.noservico = true;
                     
                            if(loaded){
                                navigator.geolocation.getCurrentPosition(function (position) {
                                    var geolocate = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                                    $scope.map.setCenter(geolocate);
                                    
                                    
                                });
                            }
                            
                            
                        }

                        })
        .error(function (data, status, headers, config) {
         
            console.log('erro ao buscar pontos por lat lng');
            
        });
    }

});