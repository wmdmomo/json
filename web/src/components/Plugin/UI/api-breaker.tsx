/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React from 'react';
import type { FormInstance } from 'antd/es/form';
import { Button, Form, InputNumber } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useIntl } from 'umi';

type Props = {
  form: FormInstance;
  schema: Record<string, any> | undefined;
};

const FORM_ITEM_LAYOUT = {
  labelCol: {
    span: 7,
  },
  wrapperCol: {
    span: 7
  },
};

const FORM_ITEM_WITHOUT_LABEL = {
  wrapperCol: {
    sm: { span: 14, offset: 7 },
  },
};
type props = {
  name: string,
  item: Record<string, any>;
  parentName: string[];
  requiredPro: string[];
};
const FormNode: React.FC<props> = ({ name, item, parentName, requiredPro }) => {
  const { formatMessage } = useIntl()
  const required = false || (requiredPro && requiredPro.indexOf(name) > -1)

  const labelName = [parentName,name].join('.')
  return (
    <>
      <Form.Item
        label={labelName}
        name={labelName}
        rules={[{
          required,
          message: `${formatMessage({ id: 'component.global.pleaseEnter' })} ${name}`
        }]}
        // tooltip={formatMessage({ id: `component.pluginForm.api-breaker.${labelName}.tooltip` })}
        validateTrigger={['onChange', 'onBlur', 'onClick']}
        ><InputNumber min={item.minimum} max={item.maximum} required />
      </Form.Item>
    </>
  )
}
const FormList: React.FC<props> = ({ name, item, parentName, requiredPro }) => {
  const { formatMessage } = useIntl()
  const labelName = [parentName,name].join('.')
  const required = false || (requiredPro && requiredPro.indexOf(labelName) > -1)
  return (
    <>
    <Form.List name={parentName}>
      {(fields, { add, remove }) => {
          return (
            <div>
              {fields.map((field, index) => (
                <Form.Item
                  {...(index === 0 ? FORM_ITEM_LAYOUT : FORM_ITEM_WITHOUT_LABEL)}
                  label={index === 0 && labelName}
                  tooltip={formatMessage({ id: 'component.pluginForm.api-breaker.unhealthy.http_statuses.tooltip' })}
                  key={field.key}
                  rules={[{
                    required,
                    message: `${formatMessage({ id: 'component.global.pleaseEnter' })} ${name}`
                  }]}
                >
                  <Form.Item
                    {...field}
                    validateTrigger={['onChange', 'onBlur']}
                    noStyle
                  >
                    <InputNumber min={500} max={599} />
                  </Form.Item>
                  {fields.length > 1 ? (
                    <MinusCircleOutlined
                      className="dynamic-delete-button"
                      style={{ margin: '0 8px' }}
                      onClick={() => {
                        remove(field.name);
                      }}
                    />
                  ) : null}
                </Form.Item>
              ))}
              {/* 新建按钮点击 */}
              {
                <Form.Item {...FORM_ITEM_WITHOUT_LABEL}>
                  <Button
                    type="dashed"
                    onClick={() => {
                      add();
                    }}
                  >
                    <PlusOutlined /> {formatMessage({ id: 'component.global.create' })}
                  </Button>
                </Form.Item>
              }
            </div>
          );
        }}
      </Form.List>
    </>
  )
}
type test = {
  schema: Record<string, any> | undefined;
  parentName: string[];
};
const FormTest: React.FC<test> = ({ schema, parentName }) => {
  const properties: Record<string,any> = schema?.properties
  const requiredProperty: string [] = schema?.required
  return (
    <>
      {Object.keys(properties).map((item) => {
        if (item !== 'disable') {
          if (properties[item].type === 'integer') {
            return <>
              <FormNode key={item} name={item} parentName={parentName} item={properties[item]} requiredPro={requiredProperty} /></>
          }
          if (properties[item].type === 'array') {
            return <>
              <FormList key={item} name={item} parentName={parentName} item={properties[item]} requiredPro={requiredProperty} />
              <span>{parentName}</span>
              </>
          }
          // 父亲的名字也要传给它
          if (properties[item].type === 'object') {
            parentName.push(item)
            return <>
              <FormTest schema={properties[item]} parentName={parentName}></FormTest>
            </>
          }
        }
        return <></>
      })
      }</>
  )
}

const ApiBreaker: React.FC<Props> = ({ form, schema }) => {

  const properties: Record<string,any> = schema?.properties
  const requiredProperty: string [] = schema?.required

  return (
    <Form
      form={form}
      {...FORM_ITEM_LAYOUT}
      initialValues={{ unhealthy: { http_statuses: [500] }, healthy: { http_statuses: [200] } }}
    >
      {Object.keys(properties).map((item) => {
        if (item !== 'disable') {
          if (properties[item].type === 'integer') {
            return <>
              <FormNode key={item} name={item} item={properties[item]} parentName={[]} requiredPro={requiredProperty} /></>
          }
          // object的时候需要遍历
          if (properties[item].type === 'object') {
            return <>
              <FormTest schema={properties[item]} parentName={[item]}></FormTest>
            </>
          }
        }
        return <></>
      })
      }
      {/* <Form.Item
        label="break_response_code"
        name="break_response_code"
        rules={[{
          required: requiredProperty.indexOf('break_response_code')>-1,
          message: `${formatMessage({ id: 'component.global.pleaseEnter' })} break_response_code`
        }]}
        tooltip={formatMessage({ id: 'component.pluginForm.api-breaker.break_response_code.tooltip' })}
        validateTrigger={['onChange', 'onBlur', 'onClick']}
      >
        <InputNumber min={200} max={599} required />
      </Form.Item>

      <Form.Item
        label="max_breaker_sec"
        name="max_breaker_sec"
        rules={[{
          required: requiredProperty.indexOf('max_breaker_sec')>-1,
          message: `${formatMessage({ id: 'component.global.pleaseEnter' })} break_response_code`
        }]}
        initialValue={300}
        tooltip={formatMessage({ id: 'component.pluginForm.api-breaker.max_breaker_sec.tooltip' })}
      >
        <InputNumber min={3} />
      </Form.Item>

      <Form.List name={['unhealthy', 'http_statuses']}>
        {(fields, { add, remove }) => {
          return (
            <div>
              {fields.map((field, index) => (
                <Form.Item
                  {...(index === 0 ? FORM_ITEM_LAYOUT : FORM_ITEM_WITHOUT_LABEL)}
                  label={index === 0 && 'unhealthy.http_statuses'}
                  tooltip={formatMessage({ id: 'component.pluginForm.api-breaker.unhealthy.http_statuses.tooltip' })}
                  key={field.key}
                >
                  <Form.Item
                    {...field}
                    validateTrigger={['onChange', 'onBlur']}
                    noStyle
                  >
                    <InputNumber min={500} max={599} />
                  </Form.Item>
                  {fields.length > 1 ? (
                    <MinusCircleOutlined
                      className="dynamic-delete-button"
                      style={{ margin: '0 8px' }}
                      onClick={() => {
                        remove(field.name);
                      }}
                    />
                  ) : null}
                </Form.Item>
              ))}
              {
                <Form.Item {...FORM_ITEM_WITHOUT_LABEL}>
                  <Button
                    type="dashed"
                    onClick={() => {
                      add();
                    }}
                  >
                    <PlusOutlined /> {formatMessage({ id: 'component.global.create' })}
                  </Button>
                </Form.Item>
              }
            </div>
          );
        }}
      </Form.List>

      <Form.Item
        label="unhealthy.failures"
        name={['unhealthy', 'failures']}
        initialValue={3}
        tooltip={formatMessage({ id: 'component.pluginForm.api-breaker.unhealthy.failures.tooltip' })}
      >
        <InputNumber min={1} />
      </Form.Item>

      <Form.List name={['healthy', 'http_statuses']}>
        {(fields, { add, remove }) => {
          return (
            <div>
              {fields.map((field, index) => (
                <Form.Item
                  {...(index === 0 ? FORM_ITEM_LAYOUT : FORM_ITEM_WITHOUT_LABEL)}
                  key={field.key}
                  label={index === 0 && 'healthy.http_statuses'}
                  tooltip={formatMessage({ id: 'component.pluginForm.api-breaker.healthy.http_statuses.tooltip' })}
                >
                  <Form.Item
                    {...field}
                    validateTrigger={['onChange', 'onBlur']}
                    noStyle
                  >
                    <InputNumber min={200} max={499} />
                  </Form.Item>
                  {fields.length > 1 ? (
                    <MinusCircleOutlined
                      className="dynamic-delete-button"
                      style={{ margin: '0 8px' }}
                      onClick={() => {
                        remove(field.name);
                      }}
                    />
                  ) : null}
                </Form.Item>
              ))}
              {
                <Form.Item {...FORM_ITEM_WITHOUT_LABEL}>
                  <Button
                    type="dashed"
                    onClick={() => {
                      add();
                    }}
                  >
                    <PlusOutlined /> {formatMessage({ id: 'component.global.create' })}
                  </Button>
                </Form.Item>
              }
            </div>
          );
        }}
      </Form.List>

      <Form.Item
        label="healthy.successes"
        name={['healthy', 'successes']}
        initialValue={3}
        tooltip={formatMessage({ id: 'component.pluginForm.api-breaker.healthy.successes.tooltip' })}
      >
        <InputNumber min={1} />
      </Form.Item> */}
    </Form >
  );
}

export default ApiBreaker;
