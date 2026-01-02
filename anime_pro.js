(function() {
    'use strict';

    function AnimeTMDB() {
        var network = new Lampa.Request();
        var scroll  = new Lampa.Scroll({mask:true, over:true});
        var html    = $('<div class="category-full"></div>');

        this.create = function() {
            scroll.append(html);
            this.load();
            return scroll.render();
        };

        this.load = function() {
            Lampa.Loading.start();
            var url = 'discover/tv?with_genres=16&with_original_language=ja&language=ru-RU&sort_by=popularity.desc';

            network.api(url, function(json){
                Lampa.Loading.stop();
                if(json && json.results && json.results.length){
                    buildList(json.results);
                } else {
                    Lampa.Noty.show('Список пуст');
                }
            }, function(){
                Lampa.Loading.stop();
                Lampa.Noty.show('Ошибка сети');
            });
        };

        function buildList(results){
            html.empty();
            results.forEach(function(item){
                if(!item.poster_path) return;

                var card = new Lampa.Card({
                    title: item.name || item.original_name,
                    img: 'https://image.tmdb.org/t/p/w500' + item.poster_path,
                    year: item.first_air_date ? item.first_air_date.split('-')[0] : ''
                });

                card.create();
                card.on('click', function(){
                    Lampa.Search.open({query:item.name || item.original_name});
                });

                html.append(card.render());
            });

            Lampa.Controller.enable('content');
        }

        this.render = function(){ return scroll.render(); };
        this.destroy = function(){ network.clear(); scroll.destroy(); html.remove(); };
    }

    function addMenu(){
        if($('.menu [data-action="anime_tmdb"]').length) return;

        Lampa.Menu.add({
            id: 'anime_tmdb',
            title: 'Аниме TMDB',
            icon:'<svg height="36" viewBox="0 0 24 24" width="36" xmlns="http://www.w3.org/2000/svg"><path d="M21 7L9 19L3.5 13.5L4.91 12.09L9 16.17L19.59 5.59L21 7Z" fill="white"/></svg>',
            onSelect:function(){
                Lampa.Activity.push({
                    title:'Аниме TMDB',
                    component:'anime_tmdb'
                });
            }
        });
    }

    if(window.appready){
        Lampa.Listener.follow('menu', function(e){
            if(e.type==='ready') addMenu();
        });
        Lampa.Component.add('anime_tmdb', AnimeTMDB);
    } else {
        Lampa.Listener.follow('app', function(e){
            if(e.type==='ready'){
                Lampa.Listener.follow('menu', function(me){
                    if(me.type==='ready') addMenu();
                });
                Lampa.Component.add('anime_tmdb', AnimeTMDB);
            }
        });
    }

})();
