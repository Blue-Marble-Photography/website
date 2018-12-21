import boto3
import datetime
from botocore.exceptions import ClientError


def lambda_handler(event, context):
  status = sendEmail(event['filename'])

  return {'status': status}


def sendEmail(filename):
  timestamp = datetime.datetime.now().isoformat()

  bodyText = (filename + ' was downloaded at ' + timestamp)

  bodyHtml = '<html><head></head><body>'
  '<p>' + filename + ' was downloaded at ' + timestamp + '</p>'
  '<p><img src="https://bluemarble.photography/assets/images/photos/"' + filename.replace('.jpg', '-750.jpg') + '"></p>'
  '</body></html>'

  client = boto3.client('ses', region_name='us-east-1')

  try:
    response = client.send_email(
        Destination={'ToAddresses': ['joseph@bluemarble.photography', ]},
        Message={'Body': {'Html': {'Charset': 'UTF-8', 'Data': bodyHtml},
                          'Text': {'Charset': 'UTF-8', 'Data': bodyText}},
                 'Subject': {'Charset': 'UTF-8', 'Data': 'Blue Marble Photography - Download Notification', }},
        Source='noreply@bluemarble.photography',
    )
  except ClientError as e:
    response = e.response['Error']['Message']
  else:
    response = 'sent'

  return response
