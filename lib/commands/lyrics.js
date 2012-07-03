(function () {
    
    module.exports = {
        keyword : 'lyrics',
        action : function (bot, user, keyword) {
            var lastPlayed = bot.lastPlayed();
            if (lastPlayed) {
                bot.lyricsClient.getSong({
                    artist : lastPlayed.metadata.artist,
                    song : lastPlayed.metadata.song
                }, function (error, response) {
                    if (!error) {
                        bot.bot.speak(bot.templates.render('lyricsOutput', {
                            url : response.url,
                            lyrics : response.lyrics
                        }));
                    }
                });
            }
        }
    }
    
}).call(this);
