require("dotenv").config();
const express=require("express");
const bodyParser=require("body-parser");
const https=require('https');

const app=express();

app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"));
app.set("view engine","ejs")

const url="https://api.openweathermap.org/data/2.5/weather?q=";
const apiKey=process.env.API_KEY;

function request(city){
    const query=url+city+"&units=metric&appid="+apiKey;
    var temperature;
    return new Promise((resolve,reject)=>{
        https.get(query,function(response){
            response.on("data",function(data){
                const weatherData=JSON.parse(data);
                temperature=weatherData.main.temp;
            })
            response.on("end",function(){
                resolve(temperature);
            })
        }).on("error",(error)=>{
            console.log(error);
            reject(error);
        });
    });
}
app.get("/",(req,res)=>{
    const cityArr=["karachi","new york","london","paris"];
    const tempArr=new Array();          //Temperature Array
    const promiseArr= new Array();
    var i=0;
    while(i<4){
        promiseArr[i]=request(cityArr[i])
        i++;
    }
    Promise.all(promiseArr).then((values)=>{
        res.render("landing",{kTemp:values[0],
            nTemp:values[1],
            lTemp:values[2],
            pTemp: values[3]
        });
    }).catch(function(){
        res.redirect("/")
    });
})
app.post("/",(req,res)=>{
    const cityName=req.body.cityName;
    const query=url+cityName+"&units=metric&appid="+apiKey;
    https.get(query,function(response){
        if(response.statusCode===200){
            response.on("data",function(data){
                const weatherData=JSON.parse(data);
                const mode=weatherData.weather[0].icon.charAt(2);
                res.render("index",{cityName:cityName,
                                    description:weatherData.weather[0].description,
                                    degrees:weatherData.main.temp,
                                    humidity: weatherData.main.humidity,
                                    pressure: weatherData.main.pressure,
                                    visibility: weatherData.visibility,
                                    wind: weatherData.wind.speed,
                                    feels: weatherData.main.feels_like,
                                    maxTemp: weatherData.main.temp_max,
                                    mode:mode
                
                })
            })
        }
        else{
            res.sendFile(__dirname+"/public/404.html");
        }
    })
})

app.listen(3000,function(){
    console.log("Server is up and running");
});