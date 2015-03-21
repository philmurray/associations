UPDATE words
   SET play_order=floor(rank/2000)*2000+random()*2000
