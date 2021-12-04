import React, {useState, useEffect} from "react";
import {useSelector, useDispatch} from 'react-redux';
import {alertActions} from '../../actions/alert.action';
import isEmpty from "is-empty";
import { makeStyles } from "@material-ui/core";
import {
    Grid,
    Box,
    CssBaseline,
    TextField,
    Button,
    Typography,
    Divider,
    Paper,
    Snackbar

} from '@material-ui/core'
import MuiAlert from '@mui/lab/Alert';

import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import getWeb3 from "../../getWeb3";
import { contractAbi } from "../../app/contractAbi";
import { pageActions } from "../../actions/pageInfo.action";
const Alert=React.forwardRef(function Alert(props, ref){
    return  <MuiAlert elevation={6} ref={ref} variant="filled" {...props}/>
  });

const useStyles=makeStyles((theme)=>({
    root:{
        flexGrow:1,
        backgroundColor:"transparent"
    },
    paper: {
      margin: theme.spacing(12),
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      elevation:3,
      width:"70%",
    },
    form: {
      width: "100%", // Fix IE 11 issue.
      marginTop: theme.spacing(1),
      padding:theme.spacing(0,0,8,0),
    },
    panel:{
        // margin:theme.spacing(2,4,2,4),
    },
    button:{
        backgroundColor:"#00aa00",
        color:"#fff",
        '&:hover': {
            backgroundColor: '#007700',
        },
        margin:theme.spacing(1,0,1,0),
        width:"98%",
    },
    textField:{
        margin:theme.spacing(1,0,1,0),
    }

}));
export default function VoterManagement(){
    const classes=useStyles();
    const alertContent = useSelector(state=>state.alert);
    const dispatch = useDispatch();
    const [address, setAddress] = useState('');
    const [alertOpen, setAlertOpen] = useState(false);
    const electionContractAddress=useSelector(state=>state.electionContractAddress);
    const [electionContract, setElectionContract] = useState(null);
    const [currentAccount, setCurrentAccount] = useState('');

    useEffect(()=>{
        dispatch(alertActions.clear());
        dispatch(pageActions.setPageName('elections'));
        checkMetaMask();
    },[]);
    
    const checkMetaMask = async() =>{
        try{
            const web3 =await getWeb3();
        
            await web3.eth.requestAccounts();
            
            const accounts = await web3.eth.getAccounts();
            
            if(accounts.length>0){
            
                setCurrentAccount(accounts[0]);
            }
            const contract = new web3.eth.Contract(contractAbi,electionContractAddress);
            
            setElectionContract(contract);
            
        } catch(error){
            dispatch(alertActions.error("Can't found MetaMask. Please install MetaMask or unlock Metask."));
            setAlertOpen(true);
        }
        
    }
    const handleAlertClose=(event,reason)=>{
        if(reason==="clickaway"){
            return;
        }

        setAlertOpen(false);
    }
    const handelAddressChange=(e)=>{
        const value = e.target.value;
        setAddress(value);
    }
    const handleAddVoter= async() =>{
        const web3 =await getWeb3();
        console.log(address);
        if(!address){
            dispatch(alertActions.error("please input address."));
            setAlertOpen(true);
            return;
        }
        try{
            
            electionContract.methods.adminAddVoter(address).send({
                from: currentAccount,
                value: web3.utils.toWei('0.01', 'ether')
            })
            .on('transactionHash', function(hash){
                // $('#addSpinner').removeClass('d-block').addClass('d-none');
            })
            .on('receipt', function(receipt){
                dispatch(alertActions.success("You add new voter and transfer fee foor vote successfully."));
                setAlertOpen(true);
                setAddress('');
            })
            .on('error', function(error, receipt) {
                dispatch(alertActions.error("Some thing wrong with this transaction!"));
                setAlertOpen(true);
            });
        } catch(err){
            console.log(err);
            dispatch(alertActions.error("Invalid address or some thing wrong with this transaction!"));
            setAlertOpen(true);
        }
        
    }
    const handleRemoveVoter=()=>{
        if(!address){
            dispatch(alertActions.error("please input address."));
            setAlertOpen(true);
            return;
        }
        try{
            alert(currentAccount);
            electionContract.methods.adminRemoveVoter(address).send({
                from: currentAccount
            })
            .on('transactionHash', function(hash){
                // $('#addSpinner').removeClass('d-block').addClass('d-none');
            })
            .on('receipt', function(receipt){
                dispatch(alertActions.success("Your transaction to add a new voter is approved."));
                setAlertOpen(true);
            })
            .on('error', function(error, receipt) {
                dispatch(alertActions.error("Some thing wrong with this transaction!"));
                setAddress('');
                setAlertOpen(true);
            });
        } catch(err){
            console.log(err);
            dispatch(alertActions.error("Invalid address or some thing wrong with this transaction!"));
            setAlertOpen(true);
        }
    }

    return(
        <>
            {
                <Snackbar open={!isEmpty(alertContent) && alertOpen} autoHideDuration={6000} onClose={handleAlertClose}>
                    <Alert onClose={handleAlertClose} severity={alertContent.type} sx={{width:'100%'}}>
                    {alertContent.message}
                    </Alert>
                </Snackbar>
            }
            <Grid component="main" className={classes.root}>
               
                <Grid container justifyContent="center">
                    <Paper className={classes.paper} 
                       elevation={24}>
                        <CssBaseline/>
                        <Grid container>
                            <Typography variant="h5" style={{marginLeft:"8vw", paddingTop:"2vw", paddingBottom:"2vh"}}>
                                (Add/Remove) Voters
                            </Typography>
                        </Grid>
                        <Divider style={{width:"100%"}}/>
                        <Grid container justifyContent="center" item md={12} style={{width:"70%", paddingTop:"20px"}}>
                            <form className={classes.form}>
                                
                                <Grid container>
                                    <Grid  container justifyContent="center" >
                                        <TextField
                                            variant="outlined"
                                            label="Address"
                                            required
                                            fullWidth
                                            className={classes.textField}
                                            value={address}
                                            onChange={handelAddressChange}
                                        />
                                    </Grid>
                                    
                                </Grid>
                                <Grid container>
                                    <Grid container item md={6} justifyContent="center"> 
                                        <Button className={classes.button}  startIcon={<PersonAddAlt1Icon />} onClick={handleAddVoter}>
                                            Add     
                                        </Button>
                                    </Grid>
                                    <Grid container item md={6} justifyContent="center">
                                        <Button className={classes.button} startIcon={<PersonRemoveIcon />} onClick={handleRemoveVoter}>
                                            Remove
                                        </Button>
                                    </Grid>
                                </Grid>
                               
                            </form>
                        </Grid>
                        
                    </Paper>
                </Grid>
            </Grid>
        </>
    );
}