import React,  {Component} from 'react';
import {StyleSheet, Text, TextInput,Vibration,View, Button} from 'react-native';
import moment from 'moment';

export default class App extends Component{
  //variavel state com os valores que controlam toda a aplicação
    state = {
        start: false,
        bombaClock:{
            horas:'',
            minutos: '',
            segundos:''
        },
        password:'',
        passwordSaved: '',
        message: '',
        status: 'Start',
        erro: false//variavel que indica se houve erro
    }
    //responsavel por definir o interval do contador da bomba relogio
    countdownInterval = 0;
    //metodo responsavel por iniciar o contador da bomba
    startCountdown = ()=>{
        const explodeTime = moment();//variavel que irá definir o tempo final da aplicação
        let segundos = this.state.bombaClock.segundos? this.state.bombaClock.segundos: 0
        let minutos = this.state.bombaClock.minutos? this.state.bombaClock.minutos: 0
        let horas = this.state.bombaClock.horas? this.state.bombaClock.horas: 0

        explodeTime//adiciona os valores de (h,m,s) a serem contados para definir o tempo final do contador
        .add(segundos, 'seconds')
        .add(minutos, 'minutes')
        .add(horas, "hours")

        const currentTime = moment()//pega o tempo atual
        let diffTime = explodeTime.unix() - currentTime.unix()//tira a diferença entre os tempo final e inicial
        let duration = moment.duration(diffTime*1000,'milliseconds')
        const interval = 1000;

        if(diffTime > 0){
            this.countdownInterval = setInterval(()=>{
                duration = moment.duration(duration.asMilliseconds() - interval, 'milliseconds')//define o tempo restante em ms
                if(this.state.erro){//se houve tentativa errada
                  duration = moment.duration(duration.asMilliseconds() - 3000, 'milliseconds')//diminue 3 segundos
                  this.setState({erro:false});//retorna a variavel que indica erro para false
                }
                horas = moment.duration(duration).hours().toString()//pega as horas
                minutos = moment.duration(duration).minutes().toString()//pega os minutos
                segundos = moment.duration(duration).seconds().toString()//pega os segundos

                const bombaClock = this.state.bombaClock;//pega a variavel de state referente ao tempo
                bombaClock.horas = horas.length === 1 ? '0' + horas: horas;
                bombaClock.minutos = minutos.length === 1 ? '0' + minutos: minutos;
                bombaClock.segundos = segundos.length === 1 ? '0' + segundos: segundos;

                if(bombaClock.horas <= 0 && bombaClock.minutos <=0 && bombaClock.segundos<=0){
                    clearInterval(this.countdownInterval)
                    this.setState({start: false, message:"A bomba explodiu", status:'Start', password:'', passwordSaved:'',erro: false});
                    this.setBombaClock('horas', '')//zerando as horas da bomba
                    this.setBombaClock('minutos', '')//zerando os minutos da bomba
                    this.setBombaClock('segundos', '')//zerando os segundos da bomba
                    Vibration.vibrate([100, 200, 300, 3000], true);
                    Vibration.cancel();
                }
                this.setState({bombaClock: bombaClock})
            }, 1000);
        }
        return null;
    }

    //Ele é chamado antes de startCountdown
    //E responsável pelas validações para que a bomba
    //seja iniciada ou encerrada
    bombActivation = () =>{
        if(!this.state.password){//só ativa se definir uma senha
            this.setState({message:"Você precisa de alguma senha!"});
            return true;
        }
        let timeIsSet = false;
        for(let key in this.state.bombaClock){
            if(this.state.bombaClock[key]){
                timeIsSet = true;
            }
        }

        if(!timeIsSet){//só ativa se algum tempo for definido
            this.setState({message:"O relógio não foi definido"});
            return true;
        }

        if(this.state.start){//caso a bomba esteja acionada
            if(this.state.password === this.state.passwordSaved){//verifica se as senhas são iguais e desativa
                clearInterval(this.countdownInterval);
                this.setState({start: false, status:"Start", password: '', passwordSaved:'', message: 'Bomba Desarmada!', erro: false})
                this.setBombaClock('horas', '')//zerando as horas da bomba
                this.setBombaClock('minutos', '')//zerando os minutos da bomba
                this.setBombaClock('segundos', '')//zerando os segundos da bomba
                return true;
            }
            this.setState({message: 'Senha Incorreta, a bomba ainda está ativa', erro: true})//seta erro como true se houve uma tentativa errada
        } else{//seta a senha e tempo da bomba
            this.setState({start:true, status:'Stop', passwordSaved: this.state.password, password:'', message: 'Bomba Ativada'});
            this.startCountdown();
            return true;
        }
        return true;
    }

    //exibe mensagem de acordo com o status passado
    showMessages = () => this.state.message ? <Text style={styles.alertText}>{this.state.message}</Text>: null

    //esse metodo é acionado no evento onChangeText
    //recebe os valores de tempo e passa para o state
    setBombaClock = (type, value) =>{
        const bombaClock = this.state.bombaClock;

        bombaClock[type] = value;
        this.setState({bombaClock: bombaClock})
    }

    render = () =>{
        return(
            <View style={styles.container}>
                {this.showMessages()}
                <View style={styles.viewClock}>
                    <TextInput 
                        style={styles.inputTime}
                        placeholder="00"
                        placeholderTextColor="rgb(255,0,0)"
                        onChangeText= {(value)=> this.setBombaClock('horas', value)}
                        value={this.state.bombaClock.horas}
                        keyboardType={'numeric'}
                        maxLength={2}
                        maxValue
                    />
                    <TextInput 
                        style={styles.inputTime}
                        placeholder="00"
                        placeholderTextColor="rgb(255,0,0)"
                        onChangeText= {(value)=> this.setBombaClock('minutos', value)}
                        value={this.state.bombaClock.minutos}
                        keyboardType={'numeric'}
                        maxLength={2}
                    />
                    <TextInput 
                        style={styles.inputTime}
                        placeholder="00"
                        placeholderTextColor="rgb(255,0,0)"
                        onChangeText= {(value)=> this.setBombaClock('segundos', value)}
                        value={this.state.bombaClock.segundos}
                        keyboardType={'numeric'}
                        maxLength={2}
                    />
                </View>
                <TextInput 
                    style={styles.input} 
                    secureTextEntry={true}
                    placeholder="DIGITE UMA SENHA"
                    placeholderTextColor="rgb(73,143,255)"
                    onChangeText= {(value)=> this.setState({password: value})}
                    value={this.state.password}
                />
                <Button
                    onPress={()=>this.bombActivation()}
                    title={this.state.status}
                    color="rgb(255,95,95)"
                    acessibilityLabel="Iniciar a Bomba"
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        flexDirection:'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgb(95,98,104)'
    },
    input:{
        backgroundColor: 'rgb(0,0,0)',
        textDecorationLine: 'none',
        height: 50,
        width: 200,
        borderRadius: 10,
        padding: 5,
        fontSize: 18,
        marginTop:10,
        marginBottom: 10,
        color: 'rgb(73,143,255)',
        textAlign: 'center'
    },
    viewClock:{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'stretch'
    },
    inputTime:{
        backgroundColor: 'rgb(0,0,0)',
        textDecorationLine: 'none',
        height: 100,
        width: 130,
        padding: 10,
        fontSize: 50,
        marginTop:10,
        marginBottom: 10,
        color: 'rgb(255,0,0)',
        textAlign: 'center',
        borderColor: "green",
        borderWidth:3
    },
    alertText:{
        backgroundColor: 'rgb(0,0,0)',
        padding: 15,
        borderRadius: 5,
        color:'green',
        fontSize: 20
    }
})