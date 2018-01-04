from datetime import datetime
import random
import time
import requests

def timer(n):
    while True:
        # random.seed()
        rand = random.random()
        data = {
            'MacAddress' : 'qa:ws:ed:rf:tg:yh',
            # 'Time' : time.strftime('%Y%m%d%H%M%S%z',time.localtime()),
            'Time' : time.time()*1000,     
            'TimeZone' : time.strftime('%z',time.localtime()),       
            'Direction' : 'Out' if rand < 0.3 else 'In' 
        }   
        r = requests.post('http://localhost:3000/api/roomdata',data = data)
        time.sleep(n)
        # print(rand)   
        # if r.status_code != 200:
        #    print(r.text)
        print(data)

timer(10)  


