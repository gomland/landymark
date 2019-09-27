import React from 'react';
import { Checkbox } from 'antd';
import FileService from '../service/FileService';

export function InlineCodeBlock(props) {
  return <span className={'markdown-inline'}>{props.value}</span>;
}

export function BlockQuoteBlock(props) {
  return <div className={'markdown-quote'}>{props.children}</div>;
}

export function TextBlock(props) {
  return (
    <span className={'markdown-text'}>{props.children}</span>
  );
}

export function LinkBlock(props) {
  return (
    <a className={'markdown-link'} href={props.href} target={'_blank'}>{props.children}</a>
  );
}

export function HeadBlock(props) {
  return (
    <div
      className={`markdown-head-block ${
        props.level < 3 ? 'markdown-underline' : ''
      }`}
      style={{
        fontSize: 24 - props.level * 1.5,
        fontWeight: 900 - props.level * 100
      }}>
      {props.children}
    </div>
  );
}

export function CodeBlock(props) {
  return (
    <pre className={'markdown-code'}>
      <code>{props.value}</code>
    </pre>
  );
}

export function TableBlock(props) {
  return (
    <td
      className={`markdown-table-cell ${props.isHeader ? 'header' : 'body'}`}
      style={{ textAlign: props.align ? props.align : 'center' }}>
      {props.children}
    </td>
  );
}

export const ListItemBlock = onCheckBoxChange => props => {
  const { checked, children } = props;

  return (
    <li>
      {checked !== null && (
        <Checkbox
          checked={checked}
          onChange={e => {
            onCheckBoxChange(
              children && children.length > 0 ? children[0].props.value : '',
              e.target.checked
            );
          }}
          style={{ paddingRight: 8 }}
        />
      )}
      {children}
    </li>
  );
};

export const ImageBlock = props => {
  let width = 'auto';
  let height = 'auto';

  if (props.alt) {
    const find = /[0-9]+\s*,\s*[0-9]+/.exec(props.alt);
    if (find && find.length > 0) {
      const split = find[0].split(',');
      width = split[0];
      height = split[1];
    }
  }

  return props.src ? (
    <img
      src={FileService.getImagePath(props.src)}
      alt={'mark_image'}
      width={width}
      height={height}
      style={{ maxWidth: '100%' }}
    />
  ) : (
    <></>
  );
};

