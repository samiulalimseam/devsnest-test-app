import { useCallback, useEffect, useState } from "react";
import { Card, TextContainer, Text, AlphaCard, Button, TextField, FormLayout, Backdrop } from "@shopify/polaris";
import { Toast } from "@shopify/app-bridge-react";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";

export function ProductsCard() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const emptyToastProps = { content: null };
  const [isLoading, setIsLoading] = useState(true);
  const [toastProps, setToastProps] = useState(emptyToastProps);
  const [user, setUser] = useState([]);
  const fetch = useAuthenticatedFetch();

  async function postUser (url='/api/createuser', data={username:name, age:age}) {

    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data)
    })
    if(response.status === 200) {
      setToastProps({ content: name+' ' +age +' '+' added successfully'});
    } else {
      setToastProps({ content: 'Error Code: ' +response.status});

    }
    
  }
    
  


  // handlechange
  

    const handleChange = useCallback(
      (newValue) => setName(newValue),
     
      [],
    );
    const handleChange2 = useCallback(
      (newValue2) => setAge(newValue2),
     
      [],
    );


    

    const toastMarkup = toastProps.content && (
      <Toast {...toastProps} onDismiss={() => setToastProps(emptyToastProps)} />
    );





    const handleClick = async () => {
      postUser();



      
      setCount(count + 1);



    };

    return (
      <>
        {toastMarkup}
        <AlphaCard>
          <FormLayout>
            
            <TextField
              label="Username"
              value={name}
              onChange={handleChange}
              autoComplete="off"
            />
            <TextField
              label="Age"
              value={age}
              onChange={handleChange2}
              autoComplete="off"
            />


            <Button  fullWidth primary onClick={handleClick} >Add User</Button>
          </FormLayout>

        </AlphaCard>
      </>
    );
  }
