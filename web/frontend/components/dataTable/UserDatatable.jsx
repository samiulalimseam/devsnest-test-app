import { Page, LegacyCard, DataTable, Button, Icon } from '@shopify/polaris';
import { Toast } from "@shopify/app-bridge-react";

import {
  DeleteMinor
} from '@shopify/polaris-icons';
import React, { useState } from 'react';
import { useAppQuery, useAuthenticatedFetch } from "../../hooks";

export default function UserDataTable() {
  const emptyToastProps = { content: null };
  const [toastProps, setToastProps] = useState(emptyToastProps);
  const fetch = useAuthenticatedFetch();
  let count = 1;


  async function deleteFromDb(id) {
    const response = await fetch('/api/deleteuser', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id })
    })
    if (response.status === 200) {
      setToastProps({ content: 'Delete Success!' });
    } else {
      setToastProps({ content: 'Error Code: ' + response.status });

    }
  }



  const toastMarkup = toastProps.content && (
    <Toast {...toastProps} onDismiss={() => setToastProps(emptyToastProps)} />
  );

  // Delete user request
  const handleDelete = (ObjectId) => {
    console.log(ObjectId);
    deleteFromDb(ObjectId);
  }

  let rows = [

  ];

  const {
    data: users,
    isLoading,
    isRefetching,
  } = useAppQuery({
    url: `/api/getuser`,
    reactQueryOptions: {
      refetchOnReconnect: true,

    }
  });
  users?.map(user => {
    rows.push([count, user?.username, user?.age, <Button onClick={() => handleDelete(user._id)} plain destructive> <Icon source={DeleteMinor} color='base'> </Icon> </Button>])
    count+=1;
  })


  return (
    <>

      {toastMarkup}
      <Page title="User list">
        <LegacyCard>
          <DataTable
            columnContentTypes={[
              'text',


            ]}
            headings={[
              '','Username', 'Age', 'Action'


            ]}
            rows={rows}

          />
        </LegacyCard>
      </Page>
    </>
  );
}